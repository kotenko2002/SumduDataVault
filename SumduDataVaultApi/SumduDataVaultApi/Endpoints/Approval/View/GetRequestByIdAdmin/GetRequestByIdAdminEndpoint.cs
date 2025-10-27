using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SumduDataVaultApi.DataAccess;
using SumduDataVaultApi.DataAccess.Entities;
using SumduDataVaultApi.Dtos;
using SumduDataVaultApi.Infrastructure.Extensions;
using SumduDataVaultApi.Infrastructure.Exceptions;
using MapsterMapper;
using System.Net;

namespace SumduDataVaultApi.Endpoints.Approval.View.GetRequestByIdAdmin
{
    public class GetRequestByIdAdminEndpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            // Адміністраторський ендпоінт - доступ до всіх запитів
            app.MapGet("requests/admin/{id:long}", (long id, AppDbContext context, HttpContext httpContext, IMapper mapper, ILogger<GetRequestByIdAdminEndpoint> logger) => 
                Handler(id, context, httpContext, mapper, logger, isUserFiltered: false))
               .WithTags("Approval Requests - View")
               .WithSummary("Отримати детальну інформацію про запит (для адміністраторів)")
               .WithDescription("Повертає детальну інформацію про конкретний запит. Доступно тільки для адміністраторів")
               .Produces<ApprovalRequestDto>()
               .Produces(StatusCodes.Status404NotFound)
               .Produces(StatusCodes.Status401Unauthorized)
               .Produces(StatusCodes.Status403Forbidden)
               .RequireAuthorization(new AuthorizeAttribute { Roles = Roles.Admin });

            // Користувацький ендпоінт - доступ тільки до власних запитів
            app.MapGet("requests/{id:long}", (long id, AppDbContext context, HttpContext httpContext, IMapper mapper, ILogger<GetRequestByIdAdminEndpoint> logger) => 
                Handler(id, context, httpContext, mapper, logger, isUserFiltered: true))
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
            long id,
            AppDbContext context,
            HttpContext httpContext,
            IMapper mapper,
            ILogger<GetRequestByIdAdminEndpoint> logger,
            bool isUserFiltered)
        {
            var userIdResult = httpContext.User.GetUserId();
            if (userIdResult.IsError)
            {
                throw new BusinessException(
                    "Неавторизований доступ",
                    HttpStatusCode.Unauthorized,
                    "Користувач не авторизований"
                );
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
                throw new BusinessException(
                    "Ресурс не знайдено",
                    HttpStatusCode.NotFound,
                    "Запит на схвалення не знайдено"
                );
            }

            // Перевірка доступу для користувацьких запитів
            if (isUserFiltered)
            {
                var userId = userIdResult.Value;
                if (!request.IsOwner(userId))
                {
                    throw new BusinessException(
                        "Доступ заборонено",
                        HttpStatusCode.Forbidden,
                        "У вас немає прав для перегляду цього запиту"
                    );
                }
            }

            var response = mapper.Map<ApprovalRequestDto>((request, false));

            return Results.Ok(response);
        }
    }
}
