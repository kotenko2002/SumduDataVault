using Newtonsoft.Json;

namespace SumduDataVaultApi.Endpoints.Datasets.SearchDataset.Models
{
    public sealed record SearchDatasetItem
    {
        [JsonIgnore] public long Id { get; init; }
        [JsonProperty("description")] public string Description { get; init; } = default!;
        [JsonProperty("region")] public string? Region { get; init; }
        [JsonProperty("collectedFrom")] public DateTimeOffset CollectedFrom { get; init; }
        [JsonProperty("collectedTo")] public DateTimeOffset CollectedTo { get; init; }
        [JsonProperty("rowCount")] public int RowCount { get; init; }
        [JsonProperty("fileSizeBytes")] public long FileSizeBytes { get; init; }
        [JsonProperty("createdAt")] public DateTimeOffset CreatedAt { get; init; }
        [JsonProperty("metadata")] public string? Metadata { get; init; }
    }
}
