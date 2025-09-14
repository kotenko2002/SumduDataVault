using Mapster;
using Newtonsoft.Json.Linq;

namespace SumduDataVaultApi.Infrastructure.Mappings
{
    public class JsonObjectMappings : IRegister
    {
        public void Register(TypeAdapterConfig config)
        {
            config.NewConfig<JObject, JObject>()
                .MapWith(src => src.DeepClone() as JObject ?? new JObject());

            config.NewConfig<JArray, JArray>()
                .MapWith(src => src.DeepClone() as JArray ?? new JArray());
        }
    }
}
