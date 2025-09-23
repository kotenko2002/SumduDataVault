using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace SumduDataVaultApi.Dtos
{
    public sealed record DatasetIndexDoc
    {
        [JsonProperty("databaseId")] public string DatabaseId { get; init; } = default!;
        [JsonProperty("description")] public string Description { get; init; } = default!;
        [JsonProperty("region")] public string? Region { get; init; }
        [JsonProperty("collectedFrom")] public DateTimeOffset CollectedFrom { get; init; }
        [JsonProperty("collectedTo")] public DateTimeOffset CollectedTo { get; init; }
        [JsonProperty("rowCount")] public int RowCount { get; init; }
        [JsonProperty("fileSizeBytes")] public long FileSizeBytes { get; init; }
        [JsonProperty("createdAt")] public DateTimeOffset CreatedAt { get; init; }
        [JsonProperty("metadata")] public JObject? Metadata { get; init; }
    }
}
