using MapsterMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SumduDataVaultApi.DataAccess;
using SumduDataVaultApi.DataAccess.Entities;
using SumduDataVaultApi.DataAccess.Enums;
using SumduDataVaultApi.Endpoints.Datasets.GetDatasetById.Models;
using SumduDataVaultApi.Infrastructure.Extensions;

namespace SumduDataVaultApi.Endpoints.Datasets.GetDatasetById
{
    public class GetDatasetByIdEndpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapGet("datasets/{id:long}", Handler)
                .WithTags("Datasets")
                .Produces<GetDatasetByIdResponse>()
                .Produces(StatusCodes.Status404NotFound)
                .RequireAuthorization();
        }

        public static async Task<IResult> Handler(
            [FromRoute] long id, 
            AppDbContext context, 
            IMapper mapper,
            HttpContext httpContext,
            ILogger<GetDatasetByIdEndpoint> logger)
        {
            try
            {
                var ds = await context.Set<Dataset>()
                    .AsNoTracking()
                    .Include(x => x.MetadataItems)
                    .FirstOrDefaultAsync(x => x.Id == id);

                if (ds is null)
                {
                    return Results.NotFound();
                }

                var response = mapper.Map<GetDatasetByIdResponse>(ds);

                var userIdResult = httpContext.User.GetUserId();
                if (userIdResult.IsError)
                {
                    return Results.Unauthorized();
                }
                var userId = userIdResult.Value;

                // Перевіряємо чи є запит на завантаження нового датасету зі статусом Pending
                var newDatasetUploadRequest = await context.ApprovalRequest
                    .AsNoTracking()
                    .Where(r =>
                        r.DatasetId == id &&
                        r.RequestType == RequestType.NewDatasetUpload &&
                        r.Status == RequestStatus.Pending)
                    .FirstOrDefaultAsync();

                // Якщо є запит на завантаження нового датасету зі статусом Pending, то датасет недоступний
                if (newDatasetUploadRequest != null)
                {
                    response = response with { AccessStatus = AccessStatus.NotAvailable };
                    return Results.Ok(response);
                }

                var accessRequest = await context.ApprovalRequest
                    .AsNoTracking()
                    .Where(r =>
                        r.RequestingUserId == userId &&
                        r.DatasetId == id &&
                        r.RequestType == RequestType.FullDataAccess)
                    .OrderByDescending(r => r.RequestedAt)
                    .FirstOrDefaultAsync();

                var accessStatus = accessRequest switch
                {
                    null => AccessStatus.NotRequested,
                    { Status: RequestStatus.Approved } => AccessStatus.Approved,
                    _ => AccessStatus.Requested
                };

                response = response with { AccessStatus = accessStatus };
                
                return Results.Ok(response);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Помилка при отриманні датасету {DatasetId}", id);
                return Results.Problem("Сталася помилка при отриманні датасету");
            }
        }
    }
}
