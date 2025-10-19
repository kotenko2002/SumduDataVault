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

        private static async Task<IResult> Handler(
            [FromRoute] long id,
            AppDbContext context,
            IMapper mapper,
            HttpContext httpContext,
            ILogger<GetDatasetByIdEndpoint> logger)
        {
            try
            {
                var userIdResult = httpContext.User.GetUserId();
                if (userIdResult.IsError)
                {
                    return Results.Unauthorized();
                }

                var dataset = await context.Set<Dataset>()
                    .AsNoTracking()
                    .Include(x => x.MetadataItems)
                    .FirstOrDefaultAsync(x => x.Id == id);

                if (dataset is null)
                {
                    return Results.NotFound();
                }

                var response = mapper.Map<GetDatasetByIdResponse>(dataset);
                var accessStatus = await DetermineAccessStatus(id, userIdResult.Value, httpContext, context);

                return Results.Ok(response with { AccessStatus = accessStatus });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error retrieving dataset {DatasetId}", id);
                return Results.Problem("An error occurred while retrieving the dataset");
            }
        }

        private static async Task<AccessStatus> DetermineAccessStatus(
            long datasetId,
            long userId,
            HttpContext httpContext,
            AppDbContext context)
        {
            var isAdmin = httpContext.User.IsAdmin() is { IsError: false, Value: true };
            if (isAdmin)
            {
                return AccessStatus.Approved;
            }

            // TODO: перемістити цю пеервірку на початок і повертати Not Found якщо не апрувнуто.
            var uploadApproved = await context.ApprovalRequest
                .AsNoTracking()
                .AnyAsync(r => r.DatasetId == datasetId &&
                              r.RequestType == RequestType.NewDatasetUpload &&
                              r.Status == RequestStatus.Approved);

            if (!uploadApproved)
            {
                return AccessStatus.NotAvailable;
            }

            var accessRequest = await context.ApprovalRequest
                .AsNoTracking()
                .Where(r => r.RequestingUserId == userId &&
                           r.DatasetId == datasetId &&
                           r.RequestType == RequestType.FullDataAccess)
                .OrderByDescending(r => r.RequestedAt)
                .FirstOrDefaultAsync();

            return accessRequest switch
            {
                null => AccessStatus.NotRequested,
                { Status: RequestStatus.Approved } => AccessStatus.Approved,
                _ => AccessStatus.Requested
            };
        }
    }
}
