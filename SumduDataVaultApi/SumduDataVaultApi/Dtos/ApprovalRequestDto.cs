using SumduDataVaultApi.DataAccess.Enums;

namespace SumduDataVaultApi.Dtos
{
    public class ApprovalRequestDto
    {
        public long Id { get; set; }
        public RequestType RequestType { get; set; }
        public string Status { get; set; } = string.Empty;
        public string UserJustification { get; set; } = string.Empty;
        public string? AdminComments { get; set; }
        public DateTime RequestedAt { get; set; }
        public DateTime? ProcessedAt { get; set; }
        public string RequestingUserName { get; set; } = string.Empty;
        public long? DatasetId { get; set; }
        public string? DatasetName { get; set; }
        public string? AdminName { get; set; }
    }
}
