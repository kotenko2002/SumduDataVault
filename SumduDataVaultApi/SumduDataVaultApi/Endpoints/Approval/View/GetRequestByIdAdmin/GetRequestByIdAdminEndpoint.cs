using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SumduDataVaultApi.DataAccess;
using SumduDataVaultApi.DataAccess.Entities;
using SumduDataVaultApi.Dtos;
using SumduDataVaultApi.Infrastructure.Extensions;
using MapsterMapper;

namespace SumduDataVaultApi.Endpoints.Approval.View.GetRequestByIdAdmin
{
    public class GetRequestByIdAdminEndpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapGet("requests/admin/{id:long}", Handler)
               .WithTags("Approval Requests - View")
               .WithSummary("Отримати детальну інформацію про запит (для адміністраторів)")
               .WithDescription("Повертає детальну інформацію про конкретний запит. Доступно тільки для адміністраторів")
               .Produces<ApprovalRequestDto>()
               .Produces(StatusCodes.Status404NotFound)
               .Produces(StatusCodes.Status401Unauthorized)
               .Produces(StatusCodes.Status403Forbidden)
               .RequireAuthorization(new AuthorizeAttribute { Roles = Roles.Admin });
        }

        public static async Task<IResult> Handler(
            [FromRoute] long id,
            AppDbContext context,
            HttpContext httpContext,
            IMapper mapper,
            ILogger<GetRequestByIdAdminEndpoint> logger)
        {
            try
            {
                var userIdResult = httpContext.User.GetUserId();
                if (userIdResult.IsError)
                {
                    return Results.Unauthorized();
                }

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

                var response = mapper.Map<ApprovalRequestDto>((request, false));

                return Results.Ok(response);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Помилка при отриманні запиту {RequestId} адміністратором", id);
                return Results.Problem("Сталася помилка при отриманні запиту");
            }
        }
    }
}
