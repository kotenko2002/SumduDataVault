using MapsterMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SumduDataVaultApi.DataAccess;
using SumduDataVaultApi.DataAccess.Entities;
using SumduDataVaultApi.DataAccess.Enums;
using SumduDataVaultApi.Endpoints.Datasets.GetDatasetById.Models;
using SumduDataVaultApi.Infrastructure.Extensions;
using SumduDataVaultApi.Infrastructure.Exceptions;
using System.Net;

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
            var userId = httpContext.User.GetUserId();

            var dataset = await context.Set<Dataset>()
                .AsNoTracking()
                .Include(x => x.MetadataItems)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (dataset is null)
            {
                throw new BusinessException(
                    "Ресурс не знайдено",
                    HttpStatusCode.NotFound,
                    "Датасет не знайдено"
                );
            }

            var response = mapper.Map<GetDatasetByIdResponse>(dataset);
            var accessStatus = await DetermineAccessStatus(id, userId, httpContext, context);

            return Results.Ok(response with { AccessStatus = accessStatus });
        }

        private static async Task<AccessStatus> DetermineAccessStatus(
            long datasetId,
            long userId,
            HttpContext httpContext,
            AppDbContext context)
        {
            var isAdmin = httpContext.User.IsAdmin();
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
