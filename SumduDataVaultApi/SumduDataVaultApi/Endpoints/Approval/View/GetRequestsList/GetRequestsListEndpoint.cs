using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SumduDataVaultApi.DataAccess;
using SumduDataVaultApi.DataAccess.Entities;
using SumduDataVaultApi.Dtos;
using MapsterMapper;

namespace SumduDataVaultApi.Endpoints.Approval.View.GetRequestsList
{
    public class GetRequestsListEndpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapPost("requests/admin", Handler)
               .WithTags("Approval Requests - View")
               .WithSummary("Отримати список запитів з можливістю фільтрації (тільки для адміністраторів)")
               .WithDescription("Повертає список всіх запитів з можливістю фільтрації за типом, статусом та датою створення")
               .Produces<List<ApprovalRequestDto>>()
               .Produces(StatusCodes.Status401Unauthorized)
               .Produces(StatusCodes.Status403Forbidden)
               .RequireAuthorization(new AuthorizeAttribute { Roles = Roles.Admin });
        }

        public static async Task<IResult> Handler(
            [FromBody] ApprovalRequestFiltersDto filters,
            AppDbContext context,
            HttpContext httpContext,
            IMapper mapper,
            ILogger<GetRequestsListEndpoint> logger)
        {
            try
            {
                var query = context.ApprovalRequest
                    .Include(r => r.Admin)
                    .Include(r => r.RequestingUser)
                    .Include(r => r.Dataset)
                    .AsQueryable();

                if (filters.RequestType.HasValue)
                {
                    query = query.Where(r => r.RequestType == filters.RequestType.Value);
                }

                // Фільтр за статусом запиту
                if (filters.Status.HasValue)
                {
                    query = query.Where(r => r.Status == filters.Status.Value);
                }

                // Фільтр за датою створення (від)
                if (filters.CreatedFrom.HasValue)
                {
                    query = query.Where(r => r.RequestedAt >= filters.CreatedFrom.Value);
                }

                // Фільтр за датою створення (до)
                if (filters.CreatedTo.HasValue)
                {
                    query = query.Where(r => r.RequestedAt <= filters.CreatedTo.Value);
                }

                // Фільтр за ПІБ користувача
                if (!string.IsNullOrEmpty(filters.UserFullName))
                {
                    query = query.Where(r => 
                        (r.RequestingUser.LastName + " " + r.RequestingUser.FirstName + " " + r.RequestingUser.MiddleName)
                        .Contains(filters.UserFullName));
                }

                var requests = await query
                    .OrderByDescending(r => r.RequestedAt)
                    .Skip(filters.Skip ?? 0)
                    .Take(filters.Take ?? 10)
                    .ToListAsync();
                
                var response = mapper.Map<List<ApprovalRequestDto>>(requests);

                return Results.Ok(response);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Помилка при отриманні списку запитів");
                return Results.Problem("Сталася помилка при отриманні списку запитів");
            }
        }
    }
}
