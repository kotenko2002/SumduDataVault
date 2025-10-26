using System.ComponentModel.DataAnnotations;

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
        
        [Range(0, int.MaxValue, ErrorMessage = "Skip must be non-negative")]
        public int Skip { get; init; } = 0;
        
        [Range(1, 100, ErrorMessage = "Take must be between 1 and 100")]
        public int Take { get; init; } = 10;
    }

    public sealed record RowCountRange(int? Min, int? Max);

    public sealed record FileSizeRange(long? Min, long? Max);
}
