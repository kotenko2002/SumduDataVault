using Microsoft.EntityFrameworkCore;
using SumduDataVaultApi.DataAccess;
using SumduDataVaultApi.Endpoints.Metadata.GetMetadataValues.Models;

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
            try
            {
                if (string.IsNullOrWhiteSpace(request.Field))
                {
                    return Results.BadRequest("Field parameter is required");
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
            catch (Exception ex)
            {
                logger.LogError(ex, "Error occurred while getting metadata values");
                return Results.Problem("An error occurred while processing the request");
            }
        }
    }
}
