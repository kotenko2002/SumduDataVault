using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SumduDataVaultApi.DataAccess;
using SumduDataVaultApi.Dtos;
using SumduDataVaultApi.Infrastructure.Extensions;
using MapsterMapper;

namespace SumduDataVaultApi.Endpoints.Approval.View.GetRequestById
{
    public class GetRequestByIdEndpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapGet("requests/{id:long}", Handler)
               .WithTags("Approval Requests - View")
               .WithSummary("Отримати детальну інформацію про запит")
               .WithDescription("Повертає детальну інформацію про конкретний запит. Користувачі можуть переглядати тільки свої запити, адміністратори - всі")
               .Produces<ApprovalRequestDto>()
               .Produces(StatusCodes.Status404NotFound)
               .Produces(StatusCodes.Status401Unauthorized)
               .Produces(StatusCodes.Status403Forbidden)
               .RequireAuthorization();
        }

        public static async Task<IResult> Handler(
            [FromRoute] long id,
            AppDbContext context,
            HttpContext httpContext,
            IMapper mapper,
            ILogger<GetRequestByIdEndpoint> logger)
        {
            try
            {
                var userIdResult = httpContext.User.GetUserId();
                if (userIdResult.IsError)
                {
                    return Results.Unauthorized();
                }
                var userId = userIdResult.Value;

                var request = await context.ApprovalRequest
                    .Include(r => r.RequestingUser)
                    .Include(r => r.Admin)
                    .Include(r => r.Dataset)
                    .Include(r => r.History)
                        .ThenInclude(h => h.ActionedByUser)
                    .FirstOrDefaultAsync(r => r.Id == id);

                if (request == null)
                {
                    return Results.NotFound();
                }

                if (!request.IsOwner(userId))
                {
                    return Results.Forbid();
                }

                var response = mapper.Map<ApprovalRequestDto>(request);

                return Results.Ok(response);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Помилка при отриманні запиту {RequestId}", id);
                return Results.Problem("Сталася помилка при отриманні запиту");
            }
        }
    }
}
