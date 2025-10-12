using Microsoft.EntityFrameworkCore;
using SumduDataVaultApi.DataAccess;
using SumduDataVaultApi.Dtos;
using SumduDataVaultApi.Infrastructure.Extensions;
using MapsterMapper;

namespace SumduDataVaultApi.Endpoints.Approval.View.GetUserRequests
{
    public class GetUserRequestsEndpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapGet("requests", Handler)
               .WithTags("Approval Requests - View")
               .WithSummary("Отримати список запитів поточного користувача")
               .WithDescription("Повертає список всіх запитів, створених поточним користувачем")
               .Produces<List<ApprovalRequestDto>>()
               .Produces(StatusCodes.Status401Unauthorized)
               .RequireAuthorization();
        }

        public static async Task<IResult> Handler(
            AppDbContext context,
            HttpContext httpContext,
            IMapper mapper,
            ILogger<GetUserRequestsEndpoint> logger)
        {
            try
            {
                var userIdResult = httpContext.User.GetUserId();
                if (userIdResult.IsError)
                {
                    return Results.Unauthorized();
                }
                var userId = userIdResult.Value;

                var requests = await context.ApprovalRequest
                    .Include(r => r.RequestingUser)
                    .Include(r => r.Admin)
                    .Include(r => r.Dataset)
                    .Where(r => r.RequestingUserId == userId)
                    .OrderByDescending(r => r.RequestedAt)
                    .ToListAsync();
                
                var response = mapper.Map<List<ApprovalRequestDto>>(requests);

                return Results.Ok(response);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Помилка при отриманні запитів користувача");
                return Results.Problem("Сталася помилка при отриманні запитів");
            }
        }
    }
}
