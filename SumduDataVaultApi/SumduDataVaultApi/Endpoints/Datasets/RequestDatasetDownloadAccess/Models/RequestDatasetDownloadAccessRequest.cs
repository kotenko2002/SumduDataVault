namespace SumduDataVaultApi.Endpoints.Datasets.RequestDatasetDownloadAccess.Models
{
    public record RequestDatasetDownloadAccessRequest(
        long DatasetId,
        string UserJustification
    );
}
