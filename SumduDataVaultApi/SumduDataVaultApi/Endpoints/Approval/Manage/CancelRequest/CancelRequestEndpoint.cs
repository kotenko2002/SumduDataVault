using Microsoft.AspNetCore.Mvc;
using SumduDataVaultApi.DataAccess;
using SumduDataVaultApi.DataAccess.Enums;
using SumduDataVaultApi.Infrastructure.Extensions;
using SumduDataVaultApi.Services.Approvals;

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
            try
            {
                var userIdResult = httpContext.User.GetUserId();
                if (userIdResult.IsError)
                {
                    return Results.Unauthorized();
                }
                var userId = userIdResult.Value;

                var approvalRequest = await context.ApprovalRequest.FindAsync(id);
                if (approvalRequest == null)
                {
                    return Results.NotFound();
                }

                var success = await approvalService.CancelRequestAsync(approvalRequest, userId);
                if (!success)
                {
                    return Results.BadRequest("Неможливо скасувати запит у поточному стані");
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
            catch (Exception ex)
            {
                logger.LogError(ex, "Помилка при скасуванні запиту {RequestId}", id);
                return Results.Problem("Сталася помилка при скасуванні запиту");
            }
        }
    }
}
