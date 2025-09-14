using Mapster;
using Newtonsoft.Json.Linq;

namespace SumduDataVaultApi.Common.Mappings
{
    /// <summary>
    /// Загальні мапінги для JSON об'єктів (JObject, JArray)
    /// </summary>
    public class JsonObjectMappings : IRegister
    {
        public void Register(TypeAdapterConfig config)
        {
            // Налаштування мапінгу для JObject
            config.NewConfig<JObject, JObject>()
                .MapWith(src => src != null ? src.DeepClone() as JObject ?? new JObject() : new JObject());
            
            // Налаштування мапінгу для JArray
            config.NewConfig<JArray, JArray>()
                .MapWith(src => src != null ? src.DeepClone() as JArray ?? new JArray() : new JArray());
        }
    }
}
