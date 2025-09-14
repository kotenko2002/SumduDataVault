using Mapster;
using SumduDataVaultApi.Dtos;
using SumduDataVaultApi.Endpoints.Datasets.SearchDataset.Models;

namespace SumduDataVaultApi.Endpoints.Datasets.SearchDataset
{
    public class SearchDatasetMapper : IRegister
    {
        public void Register(TypeAdapterConfig config)
        {
            config
                .NewConfig<DatasetIndexDoc, SearchDatasetItem>()
                .Map(dest => dest.Metadata, src => src.Metadata != null ? src.Metadata.ToString() : null);
        }
    }
}
