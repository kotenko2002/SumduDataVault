using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using OpenSearch.Client;
using OpenSearch.Net;
using SumduDataVaultApi.Infrastructure.Extensions;
using SumduDataVaultApi.Infrastructure.Configs;

namespace SumduDataVaultApi
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            builder.Services.AddControllers()
                .AddNewtonsoftJson(options =>
                {
                    options.SerializerSettings.NullValueHandling = NullValueHandling.Ignore;
                    options.SerializerSettings.DateFormatHandling = DateFormatHandling.IsoDateFormat;
                });
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
                          ""description"":     { ""type"": ""text""    },
                          ""region"":          { ""type"": ""keyword"" },
                          ""collectedFrom"":   { ""type"": ""date""    },
                          ""collectedTo"":     { ""type"": ""date""    },
                          ""createdAt"":       { ""type"": ""date""    },
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
