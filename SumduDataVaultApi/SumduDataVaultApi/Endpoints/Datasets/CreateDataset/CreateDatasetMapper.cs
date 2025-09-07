using Mapster;
using SumduDataVaultApi.DataAccess.Entities;
using SumduDataVaultApi.Dtos;
using System.Text.Json;
using SumduDataVaultApi.Endpoints.Datasets.CreateDataset.Models;

namespace SumduDataVaultApi.Endpoints.Datasets.CreateDataset
{
    public class CreateDatasetMapper : IRegister
    {
        public void Register(TypeAdapterConfig config)
        {
            config
                .NewConfig<(CreateDatasetRequest Request, CsvProcessingResult CsvResult, JsonDocument Metadata), Dataset>()
                .Map(dest => dest.FileName, src =>
                    string.IsNullOrWhiteSpace(src.Request.Csv.FileName) ? "dataset.csv" : src.Request.Csv.FileName
                ).Map(dest => dest.ChecksumSha256, src => src.CsvResult.Checksum)
                .Map(dest => dest.CsvContent, src => src.CsvResult.CsvBytes)
                .Map(dest => dest.RowCount, src => src.CsvResult.RowCount)
                .Map(dest => dest.FileSizeBytes, src => src.CsvResult.CsvBytes.LongLength)
                .Map(dest => dest.PreviewLines, src => src.CsvResult.PreviewDoc)
                .Map(dest => dest.Description, src => src.Request.Description)
                .Map(dest => dest.Region, src => src.Request.Region)
                .Map(dest => dest.CollectedFrom, src => src.Request.CollectedFrom.ToUniversalTime())
                .Map(dest => dest.CollectedTo, src => src.Request.CollectedTo.ToUniversalTime())
                .Map(dest => dest.Metadata, src => src.Metadata)
                .Map(dest => dest.CreatedAt, src => DateTimeOffset.UtcNow)
                .Map(dest => dest.UpdatedAt, src => DateTimeOffset.UtcNow);

            config
                .NewConfig<Dataset, DatasetIndexDoc>()
                .Map(dest => dest.Metadata, src => src.Metadata.RootElement.Clone());
        }
    }
}
