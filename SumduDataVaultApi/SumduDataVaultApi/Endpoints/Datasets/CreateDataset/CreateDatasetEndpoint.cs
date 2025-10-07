using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using OpenSearch.Client;
using OpenSearch.Net;
using SumduDataVaultApi.DataAccess;
using SumduDataVaultApi.DataAccess.Entities;
using System.Security.Cryptography;
using System.Text;
using MapsterMapper;
using SumduDataVaultApi.Dtos;
using SumduDataVaultApi.Endpoints.Datasets.CreateDataset.Models;
using ErrorOr;
using Error = ErrorOr.Error;
using Result = ErrorOr.Result;
using SumduDataVaultApi.Infrastructure.Configs;

namespace SumduDataVaultApi.Endpoints.Datasets.CreateDataset
{
    public class CreateDatasetEndpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapPost("datasets", Handler)
               .DisableAntiforgery()
               .WithTags("Datasets")
               .Accepts<CreateDatasetRequest>("multipart/form-data")
               .RequireAuthorization();
        }

        public static async Task<IResult> Handler(
            [FromForm] CreateDatasetRequest request,
            AppDbContext context,
            IOpenSearchClient openSearch,
            IOptions<OpenSearchConfig> openSearchConfig,
            ILogger<CreateDatasetEndpoint> logger,
            IMapper mapper
        )
        {
            try
            {
                var csvResult = await ProcessCsvFile(request.Csv);
                if (csvResult.IsError)
                {
                    return Results.BadRequest(csvResult.Errors);
                }

                var metadataResult = ProcessMetadata(request.MetadataJson);
                if (metadataResult.IsError)
                {
                    return Results.BadRequest(metadataResult.Errors);
                }

                var dataset = mapper.Map<Dataset>((request, csvResult.Value, metadataResult.Value));
                
                context.Dataset.Add(dataset);
                await context.SaveChangesAsync();
                
                // Create metadata items from the JSON metadata after dataset is saved
                var metadataItems = CreateMetadataItems(dataset, metadataResult.Value);
                context.DatasetMetadata.AddRange(metadataItems);
                await context.SaveChangesAsync();

                var indexingResult = await IndexDatasetInOpenSearch(dataset, openSearch, openSearchConfig.Value, mapper, logger);
                if (indexingResult.IsError)
                {
                    return Results.Problem("Dataset saved, but indexing into OpenSearch failed.", statusCode: StatusCodes.Status502BadGateway);
                }

                return Results.Created($"/datasets/{dataset.Id}", new CreateDatasetResponse(dataset.Id));
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                throw;
            }
        }

        private static async Task<ErrorOr<CsvProcessingResult>> ProcessCsvFile(IFormFile csvFile)
        {
            try
            {
                byte[] csvBytes;
                await using (var ms = new MemoryStream())
                {
                    await csvFile.CopyToAsync(ms);
                    csvBytes = ms.ToArray();
                }

                using var sha = SHA256.Create();
                var checksum = Convert.ToHexString(sha.ComputeHash(csvBytes)).ToLowerInvariant();

                var text = Encoding.UTF8.GetString(csvBytes);
                var lines = text.Replace("\r\n", "\n").Replace('\r', '\n')
                                .Split('\n', StringSplitOptions.RemoveEmptyEntries);
                var first10 = lines.Take(10).ToArray();
                var previewDoc = JArray.FromObject(first10);

                return new CsvProcessingResult(csvBytes, checksum, lines.Length, previewDoc);
            }
            catch (Exception ex)
            {
                return Error.Failure("CsvProcessing.Failed", $"Failed to process CSV file: {ex.Message}");
            }
        }

        private static ErrorOr<JObject> ProcessMetadata(string? metadataJson)
        {
            var metaRaw = string.IsNullOrWhiteSpace(metadataJson) ? "{}" : metadataJson;
            
            try
            {
                return JObject.Parse(metaRaw);
            }
            catch (JsonException ex)
            {
                return Error.Validation("Metadata.InvalidJson", $"Invalid JSON in 'MetadataJson': {ex.Message}");
            }
        }

        private static List<DatasetMetadata> CreateMetadataItems(Dataset dataset, JObject metadata)
        {
            var metadataItems = new List<DatasetMetadata>();
            
            foreach (var property in metadata.Properties())
            {
                var value = property.Value?.ToString() ?? string.Empty;
                if (!string.IsNullOrWhiteSpace(value))
                {
                    metadataItems.Add(new DatasetMetadata
                    {
                        DatasetId = dataset.Id, // Will be set after save
                        Field = property.Name,
                        Value = value
                    });
                }
            }
            
            return metadataItems;
        }

        private static async Task<ErrorOr<Success>> IndexDatasetInOpenSearch(
            Dataset dataset,
            IOpenSearchClient openSearch,
            OpenSearchConfig config,
            IMapper mapper,
            ILogger<CreateDatasetEndpoint> logger)
        {
            try
            {
                var indexDoc = mapper.Map<DatasetIndexDoc>(dataset);
                var json = JsonConvert.SerializeObject(indexDoc, Formatting.Indented);

                var idxResp = await openSearch.LowLevel.IndexAsync<StringResponse>(
                    config.DefaultIndex,
                    Guid.NewGuid().ToString(),
                    PostData.String(json)
                );

                if (!idxResp.Success)
                {
                    logger.LogError("Failed to index dataset {Id} into OpenSearch. Status: {StatusCode}, Body: {Body}", 
                        dataset.Id, idxResp.HttpStatusCode, idxResp.Body);

                    return Error.Failure("OpenSearch.IndexingFailed", 
                        $"Failed to index dataset {dataset.Id} into OpenSearch");
                }

                return Result.Success;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Exception occurred while indexing dataset {Id}", dataset.Id);
                return Error.Failure("OpenSearch.Exception", $"Exception occurred while indexing: {ex.Message}");
            }
        }
    }
}
