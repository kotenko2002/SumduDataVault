using Mapster;
using SumduDataVaultApi.DataAccess.Entities;
using SumduDataVaultApi.Endpoints.Datasets.GetDatasetById.Models;

namespace SumduDataVaultApi.Endpoints.Datasets.GetDatasetById
{
    public class GetDatasetByIdMapper : IRegister
    {
        public void Register(TypeAdapterConfig config)
        {
            config.NewConfig<Dataset, GetDatasetByIdResponse>()
                .Map(dest => dest.PreviewLines, src => src.PreviewLines.RootElement.Clone())
                .Map(dest => dest.Metadata, src => src.Metadata.RootElement.Clone());
        }
    }
}
