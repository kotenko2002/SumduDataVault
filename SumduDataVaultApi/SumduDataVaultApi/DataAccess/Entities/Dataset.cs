using Newtonsoft.Json.Linq;

namespace SumduDataVaultApi.DataAccess.Entities
{
    public class Dataset : BaseEntity
    {
        public required string FileName { get; set; }
        public required string ChecksumSha256 { get; set; }
        public required byte[] CsvContent { get; set; }
        public int RowCount { get; set; }
        public long FileSizeBytes { get; set; }

        public required JArray PreviewLines { get; set; }

        public string Description { get; set; } = null!;
        public string? Region { get; set; }
        public DateTimeOffset CollectedFrom { get; set; }
        public DateTimeOffset CollectedTo { get; set; }
        public required JObject Metadata { get; set; }

        public ICollection<DatasetMetadata> MetadataItems { get; set; } = new List<DatasetMetadata>();

        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.Now;
        public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.Now;
    }
}
