using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SumduDataVaultApi.DataAccess;
using SumduDataVaultApi.DataAccess.Entities;
using SumduDataVaultApi.Endpoints.Abstractions;

namespace SumduDataVaultApi.Endpoints
{
    public static class CreateDataset
    {
        public record Request(
            IFormFile Csv,
            string Description,
            string? Region,
            DateTimeOffset CollectedFrom,
            DateTimeOffset CollectedTo,
            string? MetadataJson // ← може бути null/порожній
        );

        public record Response(long Id);

        public class Endpoint : IEndpoint
        {
            public void MapEndpoint(IEndpointRouteBuilder app)
            {
                app.MapPost("datasets", Handler)
                   .DisableAntiforgery() // якщо працюєш без cookies/JWT-only
                   .WithTags("Datasets")
                   .Accepts<Request>("multipart/form-data");
            }

            public static async Task<IResult> Handler([FromForm] Request request, AppDbContext context)
            {
                if (request.Csv == null || request.Csv.Length == 0)
                    return Results.BadRequest("CSV file is required.");
                if (request.CollectedFrom > request.CollectedTo)
                    return Results.BadRequest("'CollectedFrom' must be <= 'CollectedTo'.");

                byte[] csvBytes;
                await using (var ms = new MemoryStream())
                {
                    await request.Csv.CopyToAsync(ms);
                    csvBytes = ms.ToArray();
                }

                // SHA-256
                using var sha = System.Security.Cryptography.SHA256.Create();
                var checksum = Convert.ToHexString(sha.ComputeHash(csvBytes)).ToLowerInvariant();

                // Рядки та прев’ю (10 перших)
                var text = Encoding.UTF8.GetString(csvBytes);
                var lines = text.Replace("\r\n", "\n").Replace('\r', '\n')
                                .Split('\n', StringSplitOptions.RemoveEmptyEntries);
                var first10 = lines.Take(10).ToArray();

                // Акуратний parse з повідомленням про помилку
                JsonDocument metadataDoc;
                var metaRaw = string.IsNullOrWhiteSpace(request.MetadataJson) ? "{}" : request.MetadataJson;
                try
                {
                    metadataDoc = JsonDocument.Parse(metaRaw, new JsonDocumentOptions { AllowTrailingCommas = true });
                }
                catch (JsonException ex)
                {
                    return Results.BadRequest($"Invalid JSON in 'MetadataJson': {ex.Message}");
                }

                // PreviewLines як масив рядків
                var previewDoc = JsonDocument.Parse(JsonSerializer.SerializeToUtf8Bytes(first10));

                var ds = new Dataset
                {
                    FileName = string.IsNullOrWhiteSpace(request.Csv.FileName) ? "dataset.csv" : request.Csv.FileName,
                    ChecksumSha256 = checksum,
                    CsvContent = csvBytes,
                    RowCount = lines.Length,
                    FileSizeBytes = csvBytes.LongLength,
                    PreviewLines = previewDoc,
                    Description = request.Description,
                    Region = request.Region,
                    // Npgsql зберігає timestamptz в UTC; лишай Offset=0
                    CollectedFrom = request.CollectedFrom.ToUniversalTime(),
                    CollectedTo = request.CollectedTo.ToUniversalTime(),
                    Metadata = metadataDoc,
                    CreatedAt = DateTimeOffset.UtcNow,
                    UpdatedAt = DateTimeOffset.UtcNow
                };

                context.Datasets.Add(ds);
                await context.SaveChangesAsync();

                return Results.Created($"/datasets/{ds.Id}", new Response(ds.Id));
            }
        }
    }

}
