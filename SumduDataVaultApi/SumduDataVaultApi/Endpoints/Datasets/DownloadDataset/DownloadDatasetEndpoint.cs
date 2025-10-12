using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SumduDataVaultApi.DataAccess;
using SumduDataVaultApi.DataAccess.Entities;
using SumduDataVaultApi.DataAccess.Enums;
using SumduDataVaultApi.Infrastructure.Extensions;

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
            try
            {
                var dataset = await context.Set<Dataset>()
                    .AsNoTracking()
                    .FirstOrDefaultAsync(x => x.Id == id);

                if (dataset is null)
                {
                    return Results.NotFound();
                }

                var userIdResult = httpContext.User.GetUserId();
                if (userIdResult.IsError)
                {
                    return Results.Unauthorized();
                }
                var userId = userIdResult.Value;

                var roleResult = httpContext.User.GetRole();
                var isAdmin = roleResult is { IsError: false, Value: Roles.Admin };

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
                        return Results.Forbid();
                    }
                }

                return Results.File(
                    dataset.CsvContent,
                    "text/csv",
                    dataset.FileName
                );
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Помилка при завантаженні датасету {DatasetId}", id);
                return Results.Problem("Сталася помилка при завантаженні датасету");
            }
        }
    }
}
