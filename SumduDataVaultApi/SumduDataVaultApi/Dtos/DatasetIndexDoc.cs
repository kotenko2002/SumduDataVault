using System.Text.Json;
using System.Text.Json.Serialization;

namespace SumduDataVaultApi.Dtos
{
    public sealed record DatasetIndexDoc
    {
        [JsonIgnore] public long Id { get; init; }
        [JsonPropertyName("fileName")] public string FileName { get; init; } = default!;
        [JsonPropertyName("checksumSha256")] public string ChecksumSha256 { get; init; } = default!;
        [JsonPropertyName("description")] public string Description { get; init; } = default!;
        [JsonPropertyName("region")] public string? Region { get; init; }
        [JsonPropertyName("collectedFrom")] public DateTimeOffset CollectedFrom { get; init; }
        [JsonPropertyName("collectedTo")] public DateTimeOffset CollectedTo { get; init; }
        [JsonPropertyName("rowCount")] public int RowCount { get; init; }
        [JsonPropertyName("fileSizeBytes")] public long FileSizeBytes { get; init; }
        [JsonPropertyName("createdAt")] public DateTimeOffset CreatedAt { get; init; }
        [JsonPropertyName("updatedAt")] public DateTimeOffset UpdatedAt { get; init; }
        [JsonPropertyName("metadata")] public JsonElement? Metadata { get; init; }
    }
}
