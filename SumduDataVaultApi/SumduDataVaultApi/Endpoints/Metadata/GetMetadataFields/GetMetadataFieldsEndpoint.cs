using Microsoft.EntityFrameworkCore;
using SumduDataVaultApi.DataAccess;
using SumduDataVaultApi.Endpoints.Metadata.GetMetadataFields.Models;

namespace SumduDataVaultApi.Endpoints.Metadata.GetMetadataFields
{
    public class GetMetadataFieldsEndpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapGet("metadata/fields", Handler)
                .WithTags("Metadata")
                .Produces<GetMetadataFieldsResponse>()
                .RequireAuthorization();
        }

        public static async Task<IResult> Handler(
            [AsParameters] GetMetadataFieldsRequest request,
            AppDbContext context,
            ILogger<GetMetadataFieldsEndpoint> logger)
        {
            try
            {
                var query = context.DatasetMetadata
                    .AsNoTracking()
                    .Select(x => x.Field)
                    .Distinct();

                if (!string.IsNullOrWhiteSpace(request.Search))
                {
                    var lowerSearch = request.Search.ToLower();
                    query = query.Where(x => EF.Functions.Like(x.ToLower(), $"%{lowerSearch}%"));
                }

                var fields = await query
                    .Take(10)
                    .ToListAsync();

                var response = new GetMetadataFieldsResponse
                {
                    Fields = fields
                };

                return Results.Ok(response);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error occurred while getting metadata fields");
                return Results.Problem("An error occurred while processing the request");
            }
        }
    }
}
