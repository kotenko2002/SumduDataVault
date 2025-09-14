using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace SumduDataVaultApi.DataAccess.Converters
{
    public class JArrayConverter() : ValueConverter<JArray, string>(v => v.ToString(Formatting.None) ?? "[]",
        v => string.IsNullOrEmpty(v) ? new JArray() : JArray.Parse(v));
}
