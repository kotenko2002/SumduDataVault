using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SumduDataVaultApi.DataAccess;
using SumduDataVaultApi.DataAccess.Entities;
using SumduDataVaultApi.DataAccess.Enums;
using SumduDataVaultApi.Infrastructure.Extensions;
using SumduDataVaultApi.Infrastructure.Exceptions;
using System.Net;

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
                .RequireAuthorization();
        }

        public static async Task<IResult> Handler(
            [FromRoute] long id, 
            AppDbContext context,
            HttpContext httpContext,
            ILogger<DownloadDatasetEndpoint> logger)
        {
            var dataset = await context.Set<Dataset>()
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == id);

            if (dataset is null)
            {
                throw new BusinessException(
                    "Ресурс не знайдено",
                    HttpStatusCode.NotFound,
                    "Датасет не знайдено"
                );
            }

            var userId = httpContext.User.GetUserId();

            var isAdmin = httpContext.User.IsAdmin();
            if (!isAdmin)
            {
                var approvedRequest = await context.ApprovalRequest
                    .FirstOrDefaultAsync(r => 
                        r.RequestingUserId == userId && 
                        r.DatasetId == id && 
                        r.RequestType == RequestType.FullDataAccess && 
                        r.Status == RequestStatus.Approved);

                if (approvedRequest == null)
                {
                    throw new BusinessException(
                        "Доступ заборонено",
                        HttpStatusCode.Forbidden,
                        "У вас немає дозволу на завантаження цього датасету"
                    );
                }
            }

            return Results.File(
                dataset.CsvContent,
                "text/csv",
                dataset.FileName
            );
        }
    }
}
