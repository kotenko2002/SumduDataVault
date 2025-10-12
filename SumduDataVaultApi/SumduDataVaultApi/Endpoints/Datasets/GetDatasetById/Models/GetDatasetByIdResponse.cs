using SumduDataVaultApi.DataAccess.Enums;

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
        List<string> PreviewLines,
        ICollection<DatasetMetadataDto> MetadataItems,
        DateTimeOffset CreatedAt,
        DateTimeOffset UpdatedAt,
        AccessStatus AccessStatus
    );
}
