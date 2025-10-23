using ErrorOr;
using System.Net;
using System.Security.Claims;
using SumduDataVaultApi.DataAccess.Entities;

namespace SumduDataVaultApi.Infrastructure.Extensions
{
    public static class ClaimsPrincipalExtensions
    {
        public static ErrorOr<int> GetUserId(this ClaimsPrincipal principal)
        {
            var maybeString = GetInfoByDataName(principal, "userId");

            if (maybeString.IsError)
            {
                return maybeString.Errors;
            }

            string userIdString = maybeString.Value;

            if (!int.TryParse(userIdString, out int userId))
            {
                return Error.Validation(
                    code: "InvalidUserId",
                    description: $"Unable to parse userId '{userIdString}' to an integer.");
            }

            return userId;
        }

        public static ErrorOr<string> GetRole(this ClaimsPrincipal principal)
        {
            var maybeString = GetInfoByDataName(principal, ClaimTypes.Role);

            if (maybeString.IsError)
            {
                return maybeString.Errors;
            }

            return maybeString.Value;
        }

        public static ErrorOr<bool> IsAdmin(this ClaimsPrincipal principal)
        {
            var roleResult = GetRole(principal);
            
            if (roleResult.IsError)
            {
                return roleResult.Errors;
            }
            
            return roleResult.Value == Roles.Admin;
        }

        private static ErrorOr<string> GetInfoByDataName(ClaimsPrincipal principal, string name)
        {
            var data = principal.FindFirstValue(name);
            if (data is null)
            {
                return Error.Validation(
                    code: "MissingClaim",
                    description: $"No such data as {name} in Token");
            }
            return data;
        }
    }
}
