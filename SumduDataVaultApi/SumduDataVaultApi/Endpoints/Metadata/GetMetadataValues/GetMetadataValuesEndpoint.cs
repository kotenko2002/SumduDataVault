using Microsoft.EntityFrameworkCore;
using SumduDataVaultApi.DataAccess;
using SumduDataVaultApi.Endpoints.Metadata.GetMetadataValues.Models;
using SumduDataVaultApi.Infrastructure.Exceptions;
using System.Net;

namespace SumduDataVaultApi.Endpoints.Metadata.GetMetadataValues
{
    public class GetMetadataValuesEndpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapGet("metadata/values", Handler)
                .WithTags("Metadata")
                .Produces<GetMetadataValuesResponse>()
                .Produces(StatusCodes.Status400BadRequest)
                .RequireAuthorization();
        }

        public static async Task<IResult> Handler(
            [AsParameters] GetMetadataValuesRequest request,
            AppDbContext context,
            ILogger<GetMetadataValuesEndpoint> logger)
        {
            if (string.IsNullOrWhiteSpace(request.Field))
            {
                throw new BusinessException(
                    "Невірний запит",
                    HttpStatusCode.BadRequest,
                    "Параметр Field є обов'язковим"
                );
            }

            var query = context.DatasetMetadata
                .AsNoTracking()
                .Where(x => x.Field == request.Field);

            if (!string.IsNullOrWhiteSpace(request.Value))
            {
                var lowerValue = request.Value.ToLower();
                query = query.Where(x => EF.Functions.Like(x.Value.ToLower(), $"%{lowerValue}%"));
            }

            var values = await query
                .Select(x => x.Value)
                .Distinct()
                .Take(10)
                .ToListAsync();

            var response = new GetMetadataValuesResponse
            {
                Values = values
            };

            return Results.Ok(response);
        }
    }
}
