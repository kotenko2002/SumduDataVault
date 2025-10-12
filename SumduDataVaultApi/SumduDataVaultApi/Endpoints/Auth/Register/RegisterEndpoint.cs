using Microsoft.AspNetCore.Mvc;
using SumduDataVaultApi.Endpoints.Auth.Register.Models;
using SumduDataVaultApi.Infrastructure.Configs;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using SumduDataVaultApi.DataAccess.Entities;
using MapsterMapper;

namespace SumduDataVaultApi.Endpoints.Auth.Register
{
    public class RegisterEndpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapPost("auth/register", Handler)
               .DisableAntiforgery()
               .WithTags("Authentication")
               .Accepts<RegisterRequest>("application/json");
        }

        public static async Task<IResult> Handler(
            [FromBody] RegisterRequest request,
            UserManager<User> userManager,
            IOptions<JwtConfig> jwtOptions,
            IMapper mapper,
            ILogger<RegisterEndpoint> logger
        )
        {
            try
            {
                var existingUser = await userManager.FindByEmailAsync(request.Email);
                if (existingUser != null)
                {
                    return Results.BadRequest($"Користувач з email {request.Email} вже існує!");
                }

                var user = mapper.Map<User>(request);

                var result = await userManager.CreateAsync(user, request.Password);
                if (!result.Succeeded)
                {
                    var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                    return Results.BadRequest(errors);
                }

                await userManager.AddToRoleAsync(user, Roles.Admin); // TODO: replace with Roles.Client

                return Results.Ok();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error occurred during registration for email: {Email}", request.Email);
                return Results.Problem("Сталася помилка під час реєстрації");
            }
        }
    }
}
