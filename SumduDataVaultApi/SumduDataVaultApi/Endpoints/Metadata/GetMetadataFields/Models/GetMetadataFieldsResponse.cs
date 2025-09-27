namespace SumduDataVaultApi.Endpoints.Metadata.GetMetadataFields.Models
{
    public sealed record GetMetadataFieldsRequest
    {
        public string? Search { get; init; }
    }

    public sealed record GetMetadataFieldsResponse
    {
        public required List<string> Fields { get; init; }
    }
}
