using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using SumduDataVaultApi.DataAccess;
using SumduDataVaultApi.DataAccess.Entities;
using SumduDataVaultApi.DataAccess.Enums;
using SumduDataVaultApi.Dtos;
using MapsterMapper;

namespace SumduDataVaultApi.Endpoints.Approval.View.GetPendingRequests
{
    public class GetPendingRequestsEndpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapGet("requests/admin", Handler)
               .WithTags("Approval Requests - View")
               .WithSummary("Отримати список запитів, що очікують на розгляд (тільки для адміністраторів)")
               .WithDescription("Повертає список всіх запитів зі статусом Pending")
               .Produces<List<ApprovalRequestDto>>(StatusCodes.Status200OK)
               .Produces(StatusCodes.Status401Unauthorized)
               .Produces(StatusCodes.Status403Forbidden)
               .RequireAuthorization(new AuthorizeAttribute { Roles = Roles.Admin });
        }

        public static async Task<IResult> Handler(
            AppDbContext context,
            HttpContext httpContext,
            IMapper mapper,
            ILogger<GetPendingRequestsEndpoint> logger)
        {
            try
            {
                var requests = await context.ApprovalRequest
                    .Include(r => r.Admin)
                    .Include(r => r.RequestingUser)
                    .Include(r => r.Dataset)
                    .Where(r => r.Status == RequestStatus.Pending)
                    .OrderBy(r => r.RequestedAt)
                    .ToListAsync();
                
                var response = mapper.Map<List<ApprovalRequestDto>>(requests);

                return Results.Ok(response);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Помилка при отриманні запитів, що очікують на розгляд");
                return Results.Problem("Сталася помилка при отриманні запитів");
            }
        }
    }
}
