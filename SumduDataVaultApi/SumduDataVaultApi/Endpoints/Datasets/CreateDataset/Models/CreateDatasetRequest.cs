using System.ComponentModel.DataAnnotations;

namespace SumduDataVaultApi.Endpoints.Datasets.CreateDataset.Models
{
    public record CreateDatasetRequest(
        IFormFile Csv,
        string Description,
        string? Region,
        DateTimeOffset CollectedFrom,
        DateTimeOffset CollectedTo,
        string? MetadataJson,
        [Required(ErrorMessage = "Обґрунтування запиту є обов'язковим")]
        string UserJustification
    );
}
