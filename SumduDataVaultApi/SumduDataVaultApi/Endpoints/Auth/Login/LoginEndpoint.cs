using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using SumduDataVaultApi.DataAccess.Entities;
using SumduDataVaultApi.Endpoints.Auth.Login.Models;
using SumduDataVaultApi.Infrastructure.Configs;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace SumduDataVaultApi.Endpoints.Auth.Login
{
    public class LoginEndpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapPost("auth/login", Handler)
               .DisableAntiforgery()
               .WithTags("Authentication")
               .Accepts<LoginRequest>("application/json");
        }

        public static async Task<IResult> Handler(
            [FromBody] LoginRequest request,
            UserManager<User> userManager,
            IOptions<JwtConfig> jwtOptions,
            ILogger<LoginEndpoint> logger
        )
        {
            try
            {
                var user = await userManager.FindByEmailAsync(request.Email);
                if (user == null || !await userManager.CheckPasswordAsync(user, request.Password))
                {
                    return Results.BadRequest("Неправильний email або пароль");
                }

                var userRoles = await userManager.GetRolesAsync(user);

                var authClaims = new List<Claim>
                {
                    new("userId", user.Id.ToString()),
                    new Claim(ClaimTypes.Email, user.Email),
                    new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                };
                authClaims.AddRange(userRoles.Select(role => new Claim(ClaimTypes.Role, role)));

                JwtSecurityToken accessToken = GenerateAccessToken(authClaims, jwtOptions);

                return Results.Ok(new JwtSecurityTokenHandler().WriteToken(accessToken));
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error occurred during login for email: {Email}", request.Email);
                return Results.Problem("Сталася помилка під час входу");
            }
        }

        private static JwtSecurityToken GenerateAccessToken(List<Claim> authClaims, IOptions<JwtConfig> jwtOptions)
        {
            var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.Value.Secret));

            return new JwtSecurityToken(
                issuer: jwtOptions.Value.ValidIssuer,
                audience: jwtOptions.Value.ValidAudience,
                expires: DateTime.Now.AddDays(jwtOptions.Value.TokenValidityInDays),
                claims: authClaims,
                signingCredentials: new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256)
            );
        }
    }
}
