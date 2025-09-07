using Microsoft.Extensions.Options;
using OpenSearch.Client;
using OpenSearch.Net;
using SumduDataVaultApi.Infrastructure.Extensions;
using SumduDataVaultApi.Configs;

namespace SumduDataVaultApi
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            builder.Services.AddControllers();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            builder.Services.AddMapping(builder.Configuration);
            builder.Services.AddDbContext(builder.Configuration);
            builder.Services.AddOpenSearch(builder.Configuration);

            builder.Services.AddEndpoints(typeof(Program).Assembly);

            var app = builder.Build();

            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.Lifetime.ApplicationStarted.Register(async () =>
            {
                var client = app.Services.GetRequiredService<IOpenSearchClient>();
                var config = app.Services.GetRequiredService<IOptions<OpenSearchConfig>>().Value;

                var exists = await client.Indices.ExistsAsync(config.DefaultIndex);
                if (!exists.Exists)
                {
                    const string mapping = @"
                    {
                      ""mappings"": {
                        ""properties"": {
                          ""fileName"":        { ""type"": ""keyword"" },
                          ""checksumSha256"":  { ""type"": ""keyword"" },
                          ""description"":     { ""type"": ""text""    },
                          ""region"":          { ""type"": ""keyword"" },
                          ""collectedFrom"":   { ""type"": ""date""    },
                          ""collectedTo"":     { ""type"": ""date""    },
                          ""createdAt"":       { ""type"": ""date""    },
                          ""updatedAt"":       { ""type"": ""date""    },
                          ""rowCount"":        { ""type"": ""integer"" },
                          ""fileSizeBytes"":   { ""type"": ""long""    },
                          ""metadata"":        { ""type"": ""flat_object"" }
                        }
                      }
                    }";

                    var resp = client.LowLevel.Indices.Create<StringResponse>(
                        config.DefaultIndex,
                        PostData.String(mapping)
                    );

                    if (!resp.Success)
                    {
                        throw new Exception(resp.Body);
                    }
                }
            });

            app.UseHttpsRedirection();
            app.UseAuthorization();

            app.MapControllers();
            app.MapEndpoints();

            app.Run();
        }
    }
}
