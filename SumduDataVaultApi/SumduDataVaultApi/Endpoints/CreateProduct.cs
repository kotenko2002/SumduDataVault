using SumduDataVaultApi.DataAccess;
using SumduDataVaultApi.Endpoints.Abstractions;

namespace SumduDataVaultApi.Endpoints
{
    //public static class CreateProduct
    //{
    //    public record Request(string Name, decimal Price);
    //    public record Response(int Id, string Name, decimal Price);

    //    public class Endpoint : IEndpoint
    //    {
    //        public void MapEndpoint(IEndpointRouteBuilder app)
    //        {
    //            app.MapPost("products", Handler)
    //                .WithTags("Products");
    //        }

    //        public static IResult Handler(Request request, AppDbContext context)
    //        {
    //            var product = new Product
    //            {
    //                Name = request.Name,
    //                Price = request.Price
    //            };

    //            context.Products.Add(product);

    //            context.SaveChanges();

    //            return Results.Ok();
    //        }
    //    }
    //}
}
