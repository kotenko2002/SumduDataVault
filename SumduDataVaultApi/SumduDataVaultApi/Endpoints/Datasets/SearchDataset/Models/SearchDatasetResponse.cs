namespace SumduDataVaultApi.Endpoints.Datasets.SearchDataset.Models
{
    public sealed record SearchDatasetResponse
    {
        public required IEnumerable<SearchDatasetItem> Datasets { get; init; }
        public required int TotalCount { get; init; }
        public required int Page { get; init; }
        public required int PageSize { get; init; }
        public required int TotalPages { get; init; }
    }
}
