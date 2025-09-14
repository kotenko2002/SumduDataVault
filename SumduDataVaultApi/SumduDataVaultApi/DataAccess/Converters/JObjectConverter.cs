using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace SumduDataVaultApi.DataAccess.Converters
{
    public class JObjectConverter() : ValueConverter<JObject, string>(v => v.ToString(Formatting.None) ?? "{}",
        v => string.IsNullOrEmpty(v) ? new JObject() : JObject.Parse(v));
}
