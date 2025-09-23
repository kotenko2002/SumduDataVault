using Newtonsoft.Json;

namespace SumduDataVaultApi.Endpoints.Datasets.SearchDataset.Models
{
    public sealed record SearchDatasetItem
    {
        public long Id { get; init; }
        public string Description { get; init; } = null!;
        public string? Region { get; init; }
        public DateTimeOffset CollectedFrom { get; init; }
        public DateTimeOffset CollectedTo { get; init; }
        public int RowCount { get; init; }
        public long FileSizeBytes { get; init; }
        public DateTimeOffset CreatedAt { get; init; }
        public string? Metadata { get; init; }
    }
}
