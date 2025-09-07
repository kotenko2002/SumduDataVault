using Mapster;
using SumduDataVaultApi.Endpoints.Datasets.SearchDataset.Models;

namespace SumduDataVaultApi.Endpoints.Datasets.SearchDataset
{
    public class SearchDatasetMapper : IRegister
    {
        public void Register(TypeAdapterConfig config)
        {
            // Маппер не потрібен для цього ендпоінту, оскільки ми працюємо напряму з OpenSearch
            // Але залишаємо клас для майбутнього використання
        }
    }
}
