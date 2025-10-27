using Microsoft.AspNetCore.Mvc;
using SumduDataVaultApi.DataAccess;
using SumduDataVaultApi.DataAccess.Enums;
using SumduDataVaultApi.Infrastructure.Extensions;
using SumduDataVaultApi.Infrastructure.Exceptions;
using SumduDataVaultApi.Services.Approvals;
using System.Net;

namespace SumduDataVaultApi.Endpoints.Approval.Manage.CancelRequest
{
    public class CancelRequestEndpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapPost("requests/{id:long}/cancel", Handler)
               .WithTags("Approval Requests - Manage")
               .WithSummary("Скасувати запит")
               .WithDescription("Дозволяє користувачу скасувати свій власний запит, що знаходиться в стані Pending")
               .Produces(StatusCodes.Status200OK)
               .Produces(StatusCodes.Status400BadRequest)
               .Produces(StatusCodes.Status401Unauthorized)
               .Produces(StatusCodes.Status403Forbidden)
               .Produces(StatusCodes.Status404NotFound)
               .RequireAuthorization();
        }

        public static async Task<IResult> Handler(
            [FromRoute] long id,
            IApprovalService approvalService,
            AppDbContext context,
            HttpContext httpContext,
            ILogger<CancelRequestEndpoint> logger)
        {
            var userIdResult = httpContext.User.GetUserId();
            if (userIdResult.IsError)
            {
                throw new BusinessException(
                    "Неавторизований доступ",
                    HttpStatusCode.Unauthorized,
                    "Користувач не авторизований"
                );
            }
            var userId = userIdResult.Value;

            var approvalRequest = await context.ApprovalRequest.FindAsync(id);
            if (approvalRequest == null)
            {
                throw new BusinessException(
                    "Ресурс не знайдено",
                    HttpStatusCode.NotFound,
                    "Запит на схвалення не знайдено"
                );
            }

            var success = await approvalService.CancelRequestAsync(approvalRequest, userId);
            if (!success)
            {
                throw new BusinessException(
                    "Неможливо виконати операцію",
                    HttpStatusCode.BadRequest,
                    "Неможливо скасувати запит у поточному стані"
                );
            }

            var history = new DataAccess.Entities.RequestHistory
            {
                FromState = RequestStatus.Pending,
                ToState = RequestStatus.Canceled,
                Comments = "Запит скасовано користувачем",
                Timestamp = DateTime.UtcNow,
                ApprovalRequestId = id,
                ActionedByUserId = userId
            };

            context.RequestHistory.Add(history);
            await context.SaveChangesAsync();

            return Results.Ok();
        }
    }
}
