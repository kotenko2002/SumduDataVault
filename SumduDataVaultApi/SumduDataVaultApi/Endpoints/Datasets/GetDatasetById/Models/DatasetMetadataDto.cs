namespace SumduDataVaultApi.Endpoints.Datasets.GetDatasetById.Models
{
    public record DatasetMetadataDto(
        long Id,
        string Field,
        string Value
    );
}
