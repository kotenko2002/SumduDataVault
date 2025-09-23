namespace SumduDataVaultApi.DataAccess.Entities
{
    public class DatasetMetadata : BaseEntity
    {
        public long DatasetId { get; set; }
        public required string Field { get; set; }
        public required string Value { get; set; }
    }
}
