using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using OpenSearch.Client;
using SumduDataVaultApi.Dtos;
using SumduDataVaultApi.Endpoints.Datasets.SearchDataset.Models;
using SumduDataVaultApi.Infrastructure.Configs;
using Mapster;

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

                var datasets = response.Documents.Adapt<List<SearchDatasetItem>>();
                
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
                mustQueries.Add(new MultiMatchQuery
                {
                    Fields = new[] { "description^2", "description.fuzzy" },
                    Query = request.Description,
                    Fuzziness = Fuzziness.EditDistance(2),
                    Type = TextQueryType.BestFields,
                    Operator = Operator.Or
                });
            }

            if (!string.IsNullOrWhiteSpace(request.Region))
            {
                mustQueries.Add(new MultiMatchQuery
                {
                    Fields = new[] { "region^3", "region.fuzzy" },
                    Query = request.Region,
                    Fuzziness = Fuzziness.EditDistance(1),
                    Type = TextQueryType.BestFields,
                    Operator = Operator.Or
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

            if (request.RowCount != null && (request.RowCount.Min.HasValue || request.RowCount.Max.HasValue))
            {
                var rowCountQuery = new NumericRangeQuery
                {
                    Field = "rowCount"
                };
                
                if (request.RowCount.Min.HasValue)
                    rowCountQuery.GreaterThanOrEqualTo = request.RowCount.Min.Value;
                    
                if (request.RowCount.Max.HasValue)
                    rowCountQuery.LessThanOrEqualTo = request.RowCount.Max.Value;
                    
                mustQueries.Add(rowCountQuery);
            }

            if (request.FileSizeBytes != null && (request.FileSizeBytes.Min.HasValue || request.FileSizeBytes.Max.HasValue))
            {
                var fileSizeQuery = new NumericRangeQuery
                {
                    Field = "fileSizeBytes"
                };
                
                if (request.FileSizeBytes.Min.HasValue)
                    fileSizeQuery.GreaterThanOrEqualTo = request.FileSizeBytes.Min.Value;
                    
                if (request.FileSizeBytes.Max.HasValue)
                    fileSizeQuery.LessThanOrEqualTo = request.FileSizeBytes.Max.Value;
                    
                mustQueries.Add(fileSizeQuery);
            }

            if (request.Metadata.Any())
            {
                var shouldQueries = new List<QueryContainer>();
                
                foreach (var (key, value) in request.Metadata)
                {
                    shouldQueries.Add(new MatchQuery
                    {
                        Field = $"metadata.{key}",
                        Query = value,
                        Fuzziness = Fuzziness.EditDistance(1)
                    });
                }
                
                if (shouldQueries.Any())
                {
                    mustQueries.Add(new BoolQuery
                    {
                        Should = shouldQueries,
                        MinimumShouldMatch = 1
                    });
                }
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
