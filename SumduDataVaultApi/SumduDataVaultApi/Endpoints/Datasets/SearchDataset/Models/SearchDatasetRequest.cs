namespace SumduDataVaultApi.Endpoints.Datasets.SearchDataset.Models
{
    public sealed record SearchDatasetRequest
    {
        public string? Description { get; init; }
        public string? Region { get; init; }
        public DateTimeOffset? CollectedFrom { get; init; }
        public DateTimeOffset? CollectedTo { get; init; }
        public RowCountRange? RowCount { get; init; }
        public FileSizeRange? FileSizeBytes { get; init; }
        public Dictionary<string, string> Metadata { get; init; } = new ();
        public int Page { get; init; } = 1;
        public int PageSize { get; init; } = 10;
    }

    public sealed record RowCountRange(int? Min, int? Max);

    public sealed record FileSizeRange(long? Min, long? Max);
}
