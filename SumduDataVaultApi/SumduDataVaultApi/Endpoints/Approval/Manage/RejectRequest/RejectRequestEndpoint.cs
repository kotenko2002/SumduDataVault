using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SumduDataVaultApi.DataAccess;
using SumduDataVaultApi.DataAccess.Enums;
using SumduDataVaultApi.Endpoints.Approval.Manage.RejectRequest.Models;
using SumduDataVaultApi.Infrastructure.Extensions;
using SumduDataVaultApi.DataAccess.Entities;
using SumduDataVaultApi.Services.Approvals;

namespace SumduDataVaultApi.Endpoints.Approval.Manage.RejectRequest
{
    public class RejectRequestEndpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapPost("requests/{id:long}/reject", Handler)
               .WithTags("Approval Requests - Manage")
               .WithSummary("Відхилити запит (тільки для адміністраторів)")
               .WithDescription("Дозволяє адміністратору відхилити запит на повний доступ або завантаження датасету")
               .Accepts<RejectRequestRequest>("application/json")
               .Produces(StatusCodes.Status200OK)
               .Produces(StatusCodes.Status400BadRequest)
               .Produces(StatusCodes.Status401Unauthorized)
               .Produces(StatusCodes.Status403Forbidden)
               .Produces(StatusCodes.Status404NotFound)
               .RequireAuthorization(new AuthorizeAttribute { Roles = Roles.Admin });
        }

        public static async Task<IResult> Handler(
            [FromRoute] long id,
            [FromBody] RejectRequestRequest request,
            IApprovalService approvalService,
            AppDbContext context,
            HttpContext httpContext,
            ILogger<RejectRequestEndpoint> logger)
        {
            try
            {
                var adminIdResult = httpContext.User.GetUserId();
                if (adminIdResult.IsError)
                {
                    return Results.Unauthorized();
                }
                var adminId = adminIdResult.Value;

                var approvalRequest = await context.ApprovalRequest.FindAsync(id);
                if (approvalRequest == null)
                {
                    return Results.NotFound();
                }

                var success = await approvalService.RejectRequestAsync(approvalRequest, adminId, request.AdminComments);
                if (!success)
                {
                    return Results.BadRequest("Неможливо відхилити запит у поточному стані");
                }

                var history = new RequestHistory
                {
                    FromState = RequestStatus.Pending,
                    ToState = RequestStatus.Rejected,
                    Comments = request.AdminComments,
                    Timestamp = DateTime.UtcNow,
                    ApprovalRequestId = id,
                    ActionedByUserId = adminId
                };

                context.RequestHistory.Add(history);
                await context.SaveChangesAsync();


                return Results.Ok();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Помилка при відхиленні запиту {RequestId}", id);
                return Results.Problem("Сталася помилка при відхиленні запиту");
            }
        }
    }
}
