using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SumduDataVaultApi.DataAccess;
using SumduDataVaultApi.DataAccess.Enums;
using SumduDataVaultApi.Endpoints.Datasets.RequestDatasetDownloadAccess.Models;
using SumduDataVaultApi.Infrastructure.Extensions;
using SumduDataVaultApi.Services.Approvals;

namespace SumduDataVaultApi.Endpoints.Datasets.RequestDatasetDownloadAccess
{

    public class RequestDatasetDownloadAccessEndpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapPost("requests/access", Handler)
               .WithTags("Datasets")
               .WithSummary("Створити запит на повний доступ до датасету")
               .WithDescription("Дозволяє користувачу створити запит на повний доступ до існуючого датасету")
               .Accepts<RequestDatasetDownloadAccessRequest>("application/json")
               .Produces<RequestDatasetDownloadAccessResponse>(StatusCodes.Status201Created)
               .Produces(StatusCodes.Status400BadRequest)
               .Produces(StatusCodes.Status401Unauthorized)
               .Produces(StatusCodes.Status404NotFound)
               .RequireAuthorization();
        }

        public static async Task<IResult> Handler(
            [FromBody] RequestDatasetDownloadAccessRequest request,
            IApprovalService approvalService,
            AppDbContext context,
            HttpContext httpContext,
            ILogger<RequestDatasetDownloadAccessEndpoint> logger)
        {
            try
            {
                var userIdResult = httpContext.User.GetUserId();
                if (userIdResult.IsError)
                {
                    return Results.Unauthorized();
                }
                var userId = userIdResult.Value;

                if (string.IsNullOrWhiteSpace(request.UserJustification))
                {
                    return Results.BadRequest("Обґрунтування запиту є обов'язковим");
                }

                if (request.DatasetId <= 0)
                {
                    return Results.BadRequest("Некоректний ID датасету");
                }

                var dataset = await context.Dataset.FindAsync(request.DatasetId);
                if (dataset == null)
                {
                    return Results.NotFound("Датасет не знайдено");
                }

                var existingRequest = await context.ApprovalRequest
                    .FirstOrDefaultAsync(r => 
                        r.RequestingUserId == userId && 
                        r.DatasetId == request.DatasetId && 
                        r.RequestType == RequestType.FullDataAccess && 
                        (r.Status == RequestStatus.Pending || r.Status == RequestStatus.Approved));

                if (existingRequest != null)
                {
                    if (existingRequest.Status == RequestStatus.Pending)
                    {
                        return Results.BadRequest("У вас вже є активний запит на доступ до цього датасету");
                    }
                    if (existingRequest.Status == RequestStatus.Approved)
                    {
                        return Results.BadRequest("У вас вже є схвалений доступ до цього датасету");
                    }
                }

                var approvalRequest = await approvalService.CreateRequestAsync(
                    userId, 
                    RequestType.FullDataAccess, 
                    request.UserJustification, 
                    request.DatasetId);

                var response = new RequestDatasetDownloadAccessResponse(
                    approvalRequest.Id, 
                    $"Запит на повний доступ до датасету '{dataset.FileName}' успішно створено та надіслано на розгляд");


                return Results.Created($"/requests/{approvalRequest.Id}", response);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Помилка при створенні запиту на доступ до датасету {DatasetId}", request.DatasetId);
                return Results.Problem("Сталася помилка при створенні запиту на доступ");
            }
        }
    }
}
