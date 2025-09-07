using SumduDataVaultApi.Dtos;

namespace SumduDataVaultApi.Endpoints.Datasets.SearchDataset.Models
{
    public sealed record SearchDatasetResponse
    {
        public required IEnumerable<DatasetIndexDoc> Datasets { get; init; }
        public required int TotalCount { get; init; }
    }
}
