namespace SumduDataVaultApi.Endpoints.Metadata.GetMetadataValues.Models
{
    public sealed record GetMetadataValuesResponse
    {
        public required List<string> Values { get; init; }
    }
}
