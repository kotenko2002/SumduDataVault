using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using SumduDataVaultApi.DataAccess;
using SumduDataVaultApi.DataAccess.Entities;
using SumduDataVaultApi.Endpoints.Users.SearchUsers.Models;

namespace SumduDataVaultApi.Endpoints.Users.SearchUsers
{
    public class SearchUsersEndpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapGet("users/search", Handler)
                .WithTags("Users")
                .Produces<SearchUsersResponse>()
                .RequireAuthorization(new AuthorizeAttribute { Roles = Roles.Admin });
        }

        public static async Task<IResult> Handler(
            [AsParameters] SearchUsersRequest request,
            AppDbContext context,
            ILogger<SearchUsersEndpoint> logger)
        {
            try
            {
                var lowerSearch = request.Search.ToLower();
                var query = context.Users
                    .AsNoTracking()
                    .Where(u => 
                        EF.Functions.Like((u.LastName + " " + u.FirstName + " " + u.MiddleName).ToLower(), $"%{lowerSearch}%"));

                var fullNames = await query
                    .Select(u => u.LastName + " " + u.FirstName + " " + u.MiddleName)
                    .Distinct()
                    .Take(10)
                    .ToListAsync();

                var response = new SearchUsersResponse(fullNames);

                return Results.Ok(response);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error occurred while searching users");
                return Results.Problem("An error occurred while processing the request");
            }
        }
    }
}
