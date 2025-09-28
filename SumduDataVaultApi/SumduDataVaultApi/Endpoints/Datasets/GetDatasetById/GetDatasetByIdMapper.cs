using Mapster;
using Newtonsoft.Json.Linq;
using SumduDataVaultApi.DataAccess.Entities;
using SumduDataVaultApi.Endpoints.Datasets.GetDatasetById.Models;

namespace SumduDataVaultApi.Endpoints.Datasets.GetDatasetById
{
    public class GetDatasetByIdMapper : IRegister
    {
        public void Register(TypeAdapterConfig config)
        {
            config.NewConfig<Dataset, GetDatasetByIdResponse>()
                .Map(
                    dest => dest.PreviewLines, 
                    src => src.PreviewLines.Select(line => line.Value<string>()).ToList()
                );

            config.NewConfig<DatasetMetadata, DatasetMetadataDto>();
        }
    }
}
