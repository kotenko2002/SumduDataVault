using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SumduDataVaultApi.DataAccess;
using SumduDataVaultApi.DataAccess.Entities;
using SumduDataVaultApi.Endpoints.Approval.View.GetRequestsList.Models;
using SumduDataVaultApi.Infrastructure.Extensions;
using MapsterMapper;
using SumduDataVaultApi.Dtos;

namespace SumduDataVaultApi.Endpoints.Approval.View.GetRequestsList
{
    public class GetRequestsListEndpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            // Адміністраторський ендпоінт - всі запити
            app.MapPost("requests/admin", (ApprovalRequestFiltersRequest filters, AppDbContext context, HttpContext httpContext, IMapper mapper, ILogger<GetRequestsListEndpoint> logger) => 
                Handler(filters, context, httpContext, mapper, logger, isUserFiltered: false))
               .WithTags("Approval Requests - View")
               .WithSummary("Отримати список запитів з можливістю фільтрації (тільки для адміністраторів)")
               .WithDescription("Повертає список всіх запитів з можливістю фільтрації за типом, статусом та датою створення")
               .Produces<GetRequestsListResponse>()
               .Produces(StatusCodes.Status401Unauthorized)
               .Produces(StatusCodes.Status403Forbidden)
               .RequireAuthorization(new AuthorizeAttribute { Roles = Roles.Admin });

            // Користувацький ендпоінт - тільки запити поточного користувача
            app.MapPost("requests/user", (UserRequestFiltersRequest filters, AppDbContext context, HttpContext httpContext, IMapper mapper, ILogger<GetRequestsListEndpoint> logger) => 
                Handler(filters, context, httpContext, mapper, logger, isUserFiltered: true))
               .WithTags("Approval Requests - View")
               .WithSummary("Отримати список запитів поточного користувача з можливістю фільтрації")
               .WithDescription("Повертає список всіх запитів, створених поточним користувачем, з можливістю фільтрації за типом, статусом та датою створення")
               .Produces<GetRequestsListResponse>()
               .Produces(StatusCodes.Status401Unauthorized)
               .RequireAuthorization();
        }

        // Перевантажений метод для адміністраторських фільтрів
        public static async Task<IResult> Handler(
            ApprovalRequestFiltersRequest filters,
            AppDbContext context,
            HttpContext httpContext,
            IMapper mapper,
            ILogger<GetRequestsListEndpoint> logger,
            bool isUserFiltered = false)
        {
            return await HandlerInternal(filters, context, httpContext, mapper, logger, isUserFiltered);
        }

        // Перевантажений метод для користувацьких фільтрів
        public static async Task<IResult> Handler(
            UserRequestFiltersRequest filters,
            AppDbContext context,
            HttpContext httpContext,
            IMapper mapper,
            ILogger<GetRequestsListEndpoint> logger,
            bool isUserFiltered = true)
        {
            // Конвертуємо UserRequestFiltersRequest в ApprovalRequestFiltersRequest
            var adminFilters = new ApprovalRequestFiltersRequest
            {
                RequestType = filters.RequestType,
                Status = filters.Status,
                CreatedFrom = filters.CreatedFrom,
                CreatedTo = filters.CreatedTo,
                Skip = filters.Skip,
                Take = filters.Take,
                UserFullName = null // Користувацькі фільтри не мають UserFullName
            };

            return await HandlerInternal(adminFilters, context, httpContext, mapper, logger, isUserFiltered);
        }

        // Внутрішній метод з загальною логікою
        private static async Task<IResult> HandlerInternal(
            ApprovalRequestFiltersRequest filters,
            AppDbContext context,
            HttpContext httpContext,
            IMapper mapper,
            ILogger<GetRequestsListEndpoint> logger,
            bool isUserFiltered)
        {
            try
            {
                var query = context.ApprovalRequest
                    .Include(r => r.Admin)
                    .Include(r => r.RequestingUser)
                    .Include(r => r.Dataset)
                    .AsQueryable();

                // Фільтрація по UserId з JWT (тільки для користувацьких запитів)
                if (isUserFiltered)
                {
                    var userIdResult = httpContext.User.GetUserId();
                    if (userIdResult.IsError)
                    {
                        return Results.Unauthorized();
                    }
                    var userId = userIdResult.Value;
                    query = query.Where(r => r.RequestingUserId == userId);
                }

                // Фільтр за типом запиту
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

                // Фільтр за ПІБ користувача (тільки для адміністраторських запитів)
                if (!isUserFiltered && !string.IsNullOrEmpty(filters.UserFullName))
                {
                    query = query.Where(r => 
                        (r.RequestingUser.LastName + " " + r.RequestingUser.FirstName + " " + r.RequestingUser.MiddleName)
                        .Contains(filters.UserFullName));
                }

                // Підрахунок загальної кількості записів (без skip/take)
                var total = await query.CountAsync();

                var requests = await query
                    .OrderByDescending(r => r.RequestedAt)
                    .Skip(filters.Skip ?? 0)
                    .Take(filters.Take ?? 10)
                    .ToListAsync();
                
                var response = new GetRequestsListResponse
                {
                    Requests = requests.Select(r => mapper.Map<ApprovalRequestDto>((r, true))).ToList(),
                    Total = total
                };

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
