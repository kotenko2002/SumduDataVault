using Newtonsoft.Json.Linq;

namespace SumduDataVaultApi.Endpoints.Datasets.CreateDataset.Models
{
    public record CsvProcessingResult(
        byte[] CsvBytes,
        string Checksum,
        int RowCount,
        JArray PreviewDoc
    );
}
