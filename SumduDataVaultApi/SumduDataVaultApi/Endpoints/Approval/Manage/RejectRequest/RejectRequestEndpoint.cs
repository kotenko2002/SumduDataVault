using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SumduDataVaultApi.DataAccess;
using SumduDataVaultApi.DataAccess.Enums;
using SumduDataVaultApi.Endpoints.Approval.Manage.RejectRequest.Models;
using SumduDataVaultApi.Infrastructure.Extensions;
using SumduDataVaultApi.Infrastructure.Exceptions;
using SumduDataVaultApi.DataAccess.Entities;
using SumduDataVaultApi.Services.Approvals;
using System.Net;

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
            var adminId = httpContext.User.GetUserId();

            var approvalRequest = await context.ApprovalRequest.FindAsync(id);
            if (approvalRequest == null)
            {
                throw new BusinessException(
                    "Ресурс не знайдено",
                    HttpStatusCode.NotFound,
                    "Запит на схвалення не знайдено"
                );
            }

            var success = await approvalService.RejectRequestAsync(approvalRequest, adminId, request.AdminComments);
            if (!success)
            {
                throw new BusinessException(
                    "Неможливо виконати операцію",
                    HttpStatusCode.BadRequest,
                    "Неможливо відхилити запит у поточному стані"
                );
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
    }
}
