using MapsterMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SumduDataVaultApi.DataAccess;
using SumduDataVaultApi.DataAccess.Entities;
using SumduDataVaultApi.Endpoints.Datasets.GetDatasetById.Models;

namespace SumduDataVaultApi.Endpoints.Datasets.GetDatasetById
{
    public class GetDatasetByIdEndpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapGet("datasets/{id:long}", Handler)
                .WithTags("Datasets")
                .Produces<GetDatasetByIdResponse>()
                .Produces(StatusCodes.Status404NotFound);
        }

        public static async Task<IResult> Handler([FromRoute] long id, AppDbContext context, IMapper mapper)
        {
            var ds = await context.Set<Dataset>()
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == id);

            if (ds is null)
            {
                return Results.NotFound();
            }

            var response = mapper.Map<GetDatasetByIdResponse>(ds);

            return Results.Ok(response);
        }
    }
}
