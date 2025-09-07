using System.Text.Json;

namespace SumduDataVaultApi.Endpoints.Datasets.CreateDataset.Models
{
    public record CsvProcessingResult(
        byte[] CsvBytes,
        string Checksum,
        int RowCount,
        JsonDocument PreviewDoc
    );
}
