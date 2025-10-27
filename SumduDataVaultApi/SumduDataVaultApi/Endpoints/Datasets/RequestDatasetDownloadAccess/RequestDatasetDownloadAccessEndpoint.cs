using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SumduDataVaultApi.DataAccess;
using SumduDataVaultApi.DataAccess.Enums;
using SumduDataVaultApi.Endpoints.Datasets.RequestDatasetDownloadAccess.Models;
using SumduDataVaultApi.Infrastructure.Extensions;
using SumduDataVaultApi.Infrastructure.Exceptions;
using SumduDataVaultApi.Services.Approvals;
using System.Net;

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
            var userId = httpContext.User.GetUserId();

            if (string.IsNullOrWhiteSpace(request.UserJustification))
            {
                throw new BusinessException(
                    "Невірний запит",
                    HttpStatusCode.BadRequest,
                    "Обґрунтування запиту є обов'язковим"
                );
            }

            if (request.DatasetId <= 0)
            {
                throw new BusinessException(
                    "Невірний запит",
                    HttpStatusCode.BadRequest,
                    "Некоректний ID датасету"
                );
            }

            var dataset = await context.Dataset.FindAsync(request.DatasetId);
            if (dataset == null)
            {
                throw new BusinessException(
                    "Ресурс не знайдено",
                    HttpStatusCode.NotFound,
                    "Датасет не знайдено"
                );
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
                    throw new BusinessException(
                        "Конфлікт запиту",
                        HttpStatusCode.Conflict,
                        "У вас вже є активний запит на доступ до цього датасету"
                    );
                }
                if (existingRequest.Status == RequestStatus.Approved)
                {
                    throw new BusinessException(
                        "Конфлікт запиту",
                        HttpStatusCode.Conflict,
                        "У вас вже є схвалений доступ до цього датасету"
                    );
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
    }
}
