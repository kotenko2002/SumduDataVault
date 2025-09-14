using Newtonsoft.Json.Linq;

namespace SumduDataVaultApi.Endpoints.Datasets.SearchDataset.Models
{
    public sealed record SearchDatasetRequest
    {
        public string? Description { get; init; }
        public string? Region { get; init; }
        public DateTimeOffset? CollectedFrom { get; init; }
        public DateTimeOffset? CollectedTo { get; init; }
        public int? RowCount { get; init; }
        public long? FileSizeBytes { get; init; }
        public JObject? Metadata { get; init; }
    }
}
