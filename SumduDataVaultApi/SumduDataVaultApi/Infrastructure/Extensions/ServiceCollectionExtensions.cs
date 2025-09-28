using Mapster;
using MapsterMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Options;
using Npgsql;
using OpenSearch.Client;
using OpenSearch.Client.JsonNetSerializer;
using OpenSearch.Net;
using SumduDataVaultApi.DataAccess;
using SumduDataVaultApi.DataAccess.Entities;
using SumduDataVaultApi.Endpoints;
using SumduDataVaultApi.Infrastructure.Configs;
using System.Reflection;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.Filters;
using System.Text;


namespace SumduDataVaultApi.Infrastructure.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddMapping(this IServiceCollection services, IConfiguration configuration)
        {
            var typeAdapterConfig = TypeAdapterConfig.GlobalSettings;
            typeAdapterConfig.Scan(Assembly.GetExecutingAssembly());

            services.AddSingleton(typeAdapterConfig);
            services.AddScoped<IMapper, ServiceMapper>();

            return services;
        }


        public static IServiceCollection AddDbContext(this IServiceCollection services, IConfiguration configuration)
        {
            var connString = configuration.GetConnectionString("Postgres");

            var dataSourceBuilder = new NpgsqlDataSourceBuilder(connString);
            dataSourceBuilder.UseJsonNet();

            services.AddDbContext<AppDbContext>(options => 
            {
                options.UseNpgsql(dataSourceBuilder.Build());
                options.ConfigureWarnings(warnings => 
                {
                    warnings.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.CoreEventId.ManyServiceProvidersCreatedWarning);
                });
            });

            services.AddIdentity<User, IdentityRole<int>>()
                .AddEntityFrameworkStores<AppDbContext>()
                .AddDefaultTokenProviders()
                .AddErrorDescriber<UkrainianIdentityErrorDescriber>();

            return services;
        }

        public static IServiceCollection AddOpenSearch(this IServiceCollection services, IConfiguration configuration)
        {
            services.Configure<OpenSearchConfig>(configuration.GetSection("OpenSearch"));

            services.AddSingleton<IOpenSearchClient>(serviceProvider =>
            {
                var config = serviceProvider.GetRequiredService<IOptions<OpenSearchConfig>>().Value;
                
                var uris = config.Nodes.Select(n => new Uri(n)).ToArray();
                var pool = new StaticConnectionPool(uris);

                var settings = new ConnectionSettings(pool, (builtin, s) => new JsonNetSerializer(builtin, s))
                    .DefaultIndex(config.DefaultIndex)
                    .BasicAuthentication(config.Credentials.Username, config.Credentials.Password);

                if (config.AllowInvalidCertificate)
                {
                    settings = settings.ServerCertificateValidationCallback(CertificateValidations.AllowAll);
                }

                if (config.EnableDebugMode)
                {
                    settings = settings.EnableDebugMode();
                }

                return new OpenSearchClient(settings);
            });

            return services;
        }

        public static IServiceCollection AddAuthScheme(this IServiceCollection services, IConfiguration configuration)
        {
            services.Configure<JwtConfig>(configuration.GetSection("Jwt"));

            services.AddAuthentication(options =>
                {
                    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
                })
                .AddJwtBearer(options =>
                {
                    options.SaveToken = true;
                    options.RequireHttpsMetadata = false;
                    options.TokenValidationParameters = new TokenValidationParameters()
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        ClockSkew = TimeSpan.Zero,

                        ValidAudience = configuration["Jwt:ValidAudience"],
                        ValidIssuer = configuration["Jwt:ValidIssuer"],
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["Jwt:Secret"]))
                    };
                });

            return services;
        }

        public static IServiceCollection AddSwagger(this IServiceCollection services)
        {
            return services.AddSwaggerGen(options =>
            {
                options.AddSecurityDefinition("oauth2", new OpenApiSecurityScheme
                {
                    Description = "Standard Authorization header using the Bearer scheme (\"Bearer {token}\")",
                    In = ParameterLocation.Header,
                    Name = "Authorization",
                    Type = SecuritySchemeType.ApiKey
                });

                options.OperationFilter<SecurityRequirementsOperationFilter>();
            });
        }

        public static IServiceCollection AddEndpoints(this IServiceCollection services, Assembly assembly)
        {
            ServiceDescriptor[] serviceDescriptors = assembly
                .DefinedTypes
                .Where(type => type is { IsAbstract: false, IsInterface: false } && type.IsAssignableTo(typeof(IEndpoint)))
                .Select(type => ServiceDescriptor.Transient(typeof(IEndpoint), type))
                .ToArray();

            services.TryAddEnumerable(serviceDescriptors);

            return services;
        }
    }
}
