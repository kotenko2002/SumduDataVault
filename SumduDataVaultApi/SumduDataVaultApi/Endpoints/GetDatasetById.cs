using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SumduDataVaultApi.DataAccess;
using SumduDataVaultApi.DataAccess.Entities;
using SumduDataVaultApi.Endpoints.Abstractions;

namespace SumduDataVaultApi.Endpoints
{
    public static class GetDatasetById
    {
        // DTO без CsvContent
        public record Response(
            long Id,
            string FileName,
            string ChecksumSha256,
            int RowCount,
            long FileSizeBytes,
            string Description,
            string? Region,
            DateTimeOffset CollectedFrom,
            DateTimeOffset CollectedTo,
            JsonElement PreviewLines,
            JsonElement Metadata,
            DateTimeOffset CreatedAt,
            DateTimeOffset UpdatedAt
        );

        public class Endpoint : IEndpoint
        {
            public void MapEndpoint(IEndpointRouteBuilder app)
            {
                app.MapGet("datasets/{id:long}", Handler) // {id:long} — роут-обмеження
                    .WithTags("Datasets")
                    .Produces<Response>(StatusCodes.Status200OK)
                    .Produces(StatusCodes.Status404NotFound);
            }

            public static async Task<IResult> Handler([FromRoute] long id, AppDbContext context)
            {
                var ds = await context.Set<Dataset>()
                    .AsNoTracking()
                    .FirstOrDefaultAsync(x => x.Id == id);

                if (ds is null) return Results.NotFound();

                // Клонуємо RootElement, щоб безпечно серіалізувати
                var preview = ds.PreviewLines.RootElement.Clone();
                var metadata = ds.Metadata.RootElement.Clone();

                var response = new Response(
                    ds.Id,
                    ds.FileName,
                    ds.ChecksumSha256,
                    ds.RowCount,
                    ds.FileSizeBytes,
                    ds.Description,
                    ds.Region,
                    ds.CollectedFrom,
                    ds.CollectedTo,
                    preview,
                    metadata,
                    ds.CreatedAt,
                    ds.UpdatedAt
                );

                return Results.Ok(response);
            }
        }
    }
}
