using ErrorOr;
using MapsterMapper;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using SumduDataVaultApi.DataAccess;
using SumduDataVaultApi.DataAccess.Entities;
using SumduDataVaultApi.DataAccess.Enums;
using SumduDataVaultApi.Endpoints.Datasets.CreateDataset.Models;
using SumduDataVaultApi.Infrastructure.Extensions;
using SumduDataVaultApi.Infrastructure.Exceptions;
using SumduDataVaultApi.Services.Approvals;
using System.Net;
using System.Security.Cryptography;
using System.Text;
using Error = ErrorOr.Error;

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
            IApprovalService approvalService,
            HttpContext httpContext,
            ILogger<CreateDatasetEndpoint> logger,
            IMapper mapper
        )
        {
            // Отримуємо ID користувача
            var userIdResult = httpContext.User.GetUserId();
            if (userIdResult.IsError)
            {
                throw new BusinessException(
                    "Неавторизований доступ",
                    HttpStatusCode.Unauthorized,
                    "Користувач не авторизований"
                );
            }
            var userId = userIdResult.Value;

            var csvResult = await ProcessCsvFile(request.Csv);
            if (csvResult.IsError)
            {
                var errors = csvResult.Errors.Select(e => e.Description).ToList();
                throw new BusinessException(
                    "Помилка обробки CSV файлу",
                    HttpStatusCode.BadRequest,
                    errors
                );
            }

            var metadataResult = ProcessMetadata(request.MetadataJson);
            if (metadataResult.IsError)
            {
                var errors = metadataResult.Errors.Select(e => e.Description).ToList();
                throw new BusinessException(
                    "Помилка обробки метаданих",
                    HttpStatusCode.BadRequest,
                    errors
                );
            }

            var dataset = mapper.Map<Dataset>((request, csvResult.Value, metadataResult.Value));
            
            context.Dataset.Add(dataset);
            await context.SaveChangesAsync();
            
            // Create metadata items from the JSON metadata after dataset is saved
            var metadataItems = CreateMetadataItems(dataset, metadataResult.Value);
            context.DatasetMetadata.AddRange(metadataItems);
            await context.SaveChangesAsync();

            // Створюємо запит на завантаження датасету
            var approvalRequest = await approvalService.CreateRequestAsync(
                userId, 
                RequestType.NewDatasetUpload, 
                request.UserJustification,
                dataset.Id);

            return Results.Created($"/datasets/{dataset.Id}", new CreateDatasetResponse(dataset.Id, approvalRequest.Id));
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

    }
}
