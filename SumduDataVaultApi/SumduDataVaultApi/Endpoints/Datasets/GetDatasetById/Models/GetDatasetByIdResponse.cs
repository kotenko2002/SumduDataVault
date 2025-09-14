using Newtonsoft.Json.Linq;

namespace SumduDataVaultApi.Endpoints.Datasets.GetDatasetById.Models
{
    public record GetDatasetByIdResponse(
        long Id,
        string FileName,
        string ChecksumSha256,
        int RowCount,
        long FileSizeBytes,
        string Description,
        string? Region,
        DateTimeOffset CollectedFrom,
        DateTimeOffset CollectedTo,
        JArray PreviewLines,
        JObject Metadata,
        DateTimeOffset CreatedAt,
        DateTimeOffset UpdatedAt
    );
}
