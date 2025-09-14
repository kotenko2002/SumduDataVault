using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Newtonsoft.Json.Linq;
using OpenSearch.Client;
using SumduDataVaultApi.Dtos;
using SumduDataVaultApi.Endpoints.Datasets.SearchDataset.Models;
using SumduDataVaultApi.Infrastructure.Configs;

namespace SumduDataVaultApi.Endpoints.Datasets.SearchDataset
{
    public class SearchDatasetEndpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapPost("datasets/search", Handler)
               .WithTags("Datasets")
               .Accepts<SearchDatasetRequest>("application/json")
               .Produces<SearchDatasetResponse>();
        }

        public static async Task<IResult> Handler(
            [FromBody] SearchDatasetRequest request,
            IOpenSearchClient openSearch,
            IOptions<OpenSearchConfig> openSearchConfig,
            ILogger<SearchDatasetEndpoint> logger)
        {
            try
            {
                var searchRequest = BuildSearchRequest(request, openSearchConfig.Value.DefaultIndex);
                var response = await openSearch.SearchAsync<DatasetIndexDoc>(searchRequest);

                if (!response.IsValid)
                {
                    logger.LogError("OpenSearch search failed: {Error}", response.DebugInformation);
                    return Results.Problem("Search failed", statusCode: StatusCodes.Status502BadGateway);
                }

                var datasets = response.Documents.ToList();
                var totalCount = (int)response.Total;

                var searchResponse = new SearchDatasetResponse
                {
                    Datasets = datasets,
                    TotalCount = totalCount
                };

                return Results.Ok(searchResponse);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Exception occurred during dataset search");
                return Results.Problem("Internal server error during search", statusCode: StatusCodes.Status500InternalServerError);
            }
        }

        private static SearchRequest<DatasetIndexDoc> BuildSearchRequest(SearchDatasetRequest request, string indexName)
        {
            var mustQueries = new List<QueryContainer>();

            if (!string.IsNullOrWhiteSpace(request.Description))
            {
                mustQueries.Add(new MatchQuery
                {
                    Field = "description",
                    Query = request.Description,
                    Fuzziness = Fuzziness.Auto
                });
            }

            if (!string.IsNullOrWhiteSpace(request.Region))
            {
                mustQueries.Add(new MatchQuery
                {
                    Field = "region",
                    Query = request.Region,
                    Fuzziness = Fuzziness.Auto
                });
            }

            if (request.CollectedFrom.HasValue)
            {
                mustQueries.Add(new DateRangeQuery
                {
                    Field = "collectedFrom",
                    GreaterThanOrEqualTo = DateMath.FromString(request.CollectedFrom.Value.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"))
                });
            }

            if (request.CollectedTo.HasValue)
            {
                mustQueries.Add(new DateRangeQuery
                {
                    Field = "collectedTo",
                    LessThanOrEqualTo = DateMath.FromString(request.CollectedTo.Value.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"))
                });
            }

            if (request.RowCount.HasValue)
            {
                mustQueries.Add(new TermQuery
                {
                    Field = "rowCount",
                    Value = request.RowCount.Value
                });
            }

            if (request.FileSizeBytes.HasValue)
            {
                mustQueries.Add(new TermQuery
                {
                    Field = "fileSizeBytes",
                    Value = request.FileSizeBytes.Value
                });
            }

            if (request.Metadata != null)
            {
                var metadataString = request.Metadata.ToString();
                mustQueries.Add(new MatchQuery
                {
                    Field = "metadata",
                    Query = metadataString,
                    Fuzziness = Fuzziness.Auto
                });
            }

            var searchRequest = new SearchRequest<DatasetIndexDoc>(indexName);

            if (mustQueries.Any())
            {
                searchRequest.Query = new BoolQuery { Must = mustQueries };
            }
            else
            {
                searchRequest.Query = new MatchAllQuery();
            }

            return searchRequest;
        }
    }
}
