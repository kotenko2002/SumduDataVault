using System.Text.Json;

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
        JsonElement PreviewLines,
        JsonElement Metadata,
        DateTimeOffset CreatedAt,
        DateTimeOffset UpdatedAt
    );
}
