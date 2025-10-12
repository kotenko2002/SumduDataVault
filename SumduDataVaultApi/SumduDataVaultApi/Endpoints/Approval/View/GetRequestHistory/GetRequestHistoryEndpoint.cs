using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SumduDataVaultApi.DataAccess;
using SumduDataVaultApi.Infrastructure.Extensions;

namespace SumduDataVaultApi.Endpoints.Approval.View.GetRequestHistory
{
    public class RequestHistoryDto
    {
        public long Id { get; set; }
        public string FromState { get; set; } = string.Empty;
        public string ToState { get; set; } = string.Empty;
        public string? Comments { get; set; }
        public DateTime Timestamp { get; set; }
        public string ActionedByUserName { get; set; } = string.Empty;
    }

    public class GetRequestHistoryEndpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapGet("requests/{id:long}/history", Handler)
               .WithTags("Approval Requests - View")
               .WithSummary("Отримати історію запиту")
               .WithDescription("Повертає історію змін статусу конкретного запиту")
               .Produces<List<RequestHistoryDto>>()
               .Produces(StatusCodes.Status404NotFound)
               .Produces(StatusCodes.Status401Unauthorized)
               .Produces(StatusCodes.Status403Forbidden)
               .RequireAuthorization();
        }

        public static async Task<IResult> Handler(
            [FromRoute] long id,
            AppDbContext context,
            HttpContext httpContext,
            ILogger<GetRequestHistoryEndpoint> logger)
        {
            try
            {
                var userIdResult = httpContext.User.GetUserId();
                if (userIdResult.IsError)
                {
                    return Results.Unauthorized();
                }
                var userId = userIdResult.Value;

                var request = await context.ApprovalRequest.FindAsync(id);
                if (request == null)
                {
                    return Results.NotFound();
                }

                if (!request.IsOwner(userId))
                {
                    return Results.Forbid();
                }

                var history = await context.RequestHistory
                    .Include(h => h.ActionedByUser)
                    .Where(h => h.ApprovalRequestId == id)
                    .OrderBy(h => h.Timestamp)
                    .ToListAsync();

                var response = history.Select(h => new RequestHistoryDto
                {
                    Id = h.Id,
                    FromState = h.FromState.ToString(),
                    ToState = h.ToState.ToString(),
                    Comments = h.Comments,
                    Timestamp = h.Timestamp,
                    ActionedByUserName = $"{h.ActionedByUser.FirstName} {h.ActionedByUser.LastName}"
                }).ToList();

                return Results.Ok(response);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Помилка при отриманні історії запиту {RequestId}", id);
                return Results.Problem("Сталася помилка при отриманні історії запиту");
            }
        }
    }
}
