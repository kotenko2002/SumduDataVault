using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SumduDataVaultApi.DataAccess;
using SumduDataVaultApi.DataAccess.Entities;

namespace SumduDataVaultApi.Endpoints.Datasets.DownloadDataset
{
    public class DownloadDatasetEndpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapGet("datasets/{id:long}/download", Handler)
                .WithTags("Datasets")
                .WithSummary("Скачати CSV файл датасету")
                .WithDescription("Повертає CSV файл датасету за вказаним ID")
                .Produces<FileResult>(StatusCodes.Status200OK, "text/csv")
                .Produces(StatusCodes.Status404NotFound)
                //.RequireAuthorization()
                ;
        }

        public static async Task<IResult> Handler([FromRoute] long id, AppDbContext context)
        {
            var dataset = await context.Set<Dataset>()
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == id);

            if (dataset is null)
            {
                return Results.NotFound();
            }

            return Results.File(
                dataset.CsvContent,
                "text/csv",
                dataset.FileName
            );
        }
    }
}
