using System.Net;
using System.Security.Claims;
using SumduDataVaultApi.DataAccess.Entities;
using SumduDataVaultApi.Infrastructure.Exceptions;

namespace SumduDataVaultApi.Infrastructure.Extensions
{
    public static class ClaimsPrincipalExtensions
    {
        public static int GetUserId(this ClaimsPrincipal principal)
        {
            var userIdString = GetInfoByDataName(principal, "userId");

            if (!int.TryParse(userIdString, out int userId))
            {
                throw new BusinessException(
                    "Невірний токен",
                    HttpStatusCode.Unauthorized,
                    $"Неможливо розпарсити userId '{userIdString}' в ціле число"
                );
            }

            return userId;
        }

        public static string GetRole(this ClaimsPrincipal principal)
            => GetInfoByDataName(principal, ClaimTypes.Role);

        public static bool IsAdmin(this ClaimsPrincipal principal)
            => GetRole(principal) == Roles.Admin;

        private static string GetInfoByDataName(ClaimsPrincipal principal, string name)
        {
            var data = principal.FindFirstValue(name);
            if (data is null)
            {
                throw new BusinessException(
                    "Невірний токен",
                    HttpStatusCode.Unauthorized,
                    $"Відсутній клейм {name} в токені"
                );
            }
            return data;
        }
    }
}
