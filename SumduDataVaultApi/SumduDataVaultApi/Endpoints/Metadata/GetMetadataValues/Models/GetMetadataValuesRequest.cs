namespace SumduDataVaultApi.Endpoints.Metadata.GetMetadataValues.Models
{
    public sealed record GetMetadataValuesRequest
    {
        public required string Field { get; init; }
        public string? Value { get; init; }
    }
}
