using Microsoft.AspNetCore.Mvc;
using SumduDataVaultApi.Endpoints.Auth.Register.Models;
using SumduDataVaultApi.Infrastructure.Configs;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using SumduDataVaultApi.DataAccess.Entities;
using MapsterMapper;
using SumduDataVaultApi.Infrastructure.Exceptions;
using System.Net;

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
            var existingUser = await userManager.FindByEmailAsync(request.Email);
            if (existingUser != null)
            {
                throw new BusinessException(
                    "Користувач вже існує",
                    HttpStatusCode.Conflict,
                    $"Користувач з email {request.Email} вже існує!"
                );
            }

            var user = mapper.Map<User>(request);

            var result = await userManager.CreateAsync(user, request.Password);
            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(e => e.Description).ToList();
                throw new BusinessException(
                    "Помилка створення користувача",
                    HttpStatusCode.BadRequest,
                    errors
                );
            }

            await userManager.AddToRoleAsync(user, Roles.Client);

            return Results.Ok();
        }
    }
}
