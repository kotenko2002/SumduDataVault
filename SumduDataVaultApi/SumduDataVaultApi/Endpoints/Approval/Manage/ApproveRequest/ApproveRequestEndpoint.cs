using ErrorOr;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using OpenSearch.Client;
using OpenSearch.Net;
using SumduDataVaultApi.DataAccess;
using SumduDataVaultApi.DataAccess.Enums;
using SumduDataVaultApi.Endpoints.Approval.Manage.ApproveRequest.Models;
using SumduDataVaultApi.Infrastructure.Configs;
using SumduDataVaultApi.Infrastructure.Extensions;
using SumduDataVaultApi.Infrastructure.Exceptions;
using SumduDataVaultApi.DataAccess.Entities;
using SumduDataVaultApi.Services.Approvals;
using SumduDataVaultApi.Dtos;
using MapsterMapper;
using Microsoft.EntityFrameworkCore;
using System.Net;
using Error = ErrorOr.Error;
using Result = ErrorOr.Result;

namespace SumduDataVaultApi.Endpoints.Approval.Manage.ApproveRequest
{
    public class ApproveRequestEndpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapPost("requests/{id:long}/approve", Handler)
               .WithTags("Approval Requests - Manage")
               .WithSummary("Схвалити запит (тільки для адміністраторів)")
               .WithDescription("Дозволяє адміністратору схвалити запит на повний доступ або завантаження датасету")
               .Accepts<ApproveRequestRequest>("application/json")
               .Produces(StatusCodes.Status200OK)
               .Produces(StatusCodes.Status400BadRequest)
               .Produces(StatusCodes.Status401Unauthorized)
               .Produces(StatusCodes.Status403Forbidden)
               .Produces(StatusCodes.Status404NotFound)
               .RequireAuthorization(new AuthorizeAttribute { Roles = Roles.Admin });
        }

        public static async Task<IResult> Handler(
            [FromRoute] long id,
            [FromBody] ApproveRequestRequest request,
            IApprovalService approvalService,
            AppDbContext context,
            HttpContext httpContext,
            IOpenSearchClient openSearch,
            IOptions<OpenSearchConfig> openSearchConfig,
            IMapper mapper,
            ILogger<ApproveRequestEndpoint> logger)
        {
            var adminIdResult = httpContext.User.GetUserId();
            if (adminIdResult.IsError)
            {
                throw new BusinessException(
                    "Неавторизований доступ",
                    HttpStatusCode.Unauthorized,
                    "Користувач не авторизований"
                );
            }
            var adminId = adminIdResult.Value;

            var approvalRequest = await context.ApprovalRequest
                .Include(ar => ar.Dataset)
                .FirstOrDefaultAsync(ar => ar.Id == id);
                
            if (approvalRequest == null)
            {
                throw new BusinessException(
                    "Ресурс не знайдено",
                    HttpStatusCode.NotFound,
                    "Запит на схвалення не знайдено"
                );
            }

            var success = await approvalService.ApproveRequestAsync(approvalRequest, adminId, request.AdminComments);
            if (!success)
            {
                throw new BusinessException(
                    "Неможливо виконати операцію",
                    HttpStatusCode.BadRequest,
                    "Неможливо схвалити запит у поточному стані"
                );
            }

            var history = new RequestHistory
            {
                FromState = RequestStatus.Pending,
                ToState = RequestStatus.Approved,
                Comments = request.AdminComments,
                Timestamp = DateTime.UtcNow,
                ApprovalRequestId = id,
                ActionedByUserId = adminId
            };

            context.RequestHistory.Add(history);
            await context.SaveChangesAsync();

            if (approvalRequest is { RequestType: RequestType.NewDatasetUpload, Dataset: not null })
            {
                var indexingResult = await IndexDatasetInOpenSearch(
                    approvalRequest.Dataset, 
                    openSearch, 
                    openSearchConfig.Value, 
                    mapper, 
                    logger
                );
                    
                if (indexingResult.IsError)
                {
                    logger.LogError("Помилка при індексуванні датасету {DatasetId} після схвалення запиту {RequestId}", 
                        approvalRequest.Dataset.Id, id);
                }
            }

            return Results.Ok();
        }

        private static async Task<ErrorOr<Success>> IndexDatasetInOpenSearch(
            Dataset dataset,
            IOpenSearchClient openSearch,
            OpenSearchConfig config,
            IMapper mapper,
            ILogger<ApproveRequestEndpoint> logger)
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
