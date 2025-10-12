using SumduDataVaultApi.DataAccess.Enums;

namespace SumduDataVaultApi.DataAccess.Entities
{
    public class RequestHistory : BaseEntity
    {
        public RequestStatus FromState { get; set; }
        public RequestStatus ToState { get; set; }
        public string? Comments { get; set; }
        public DateTime Timestamp { get; set; }

        public long ApprovalRequestId { get; set; }
        public virtual ApprovalRequest ApprovalRequest { get; set; }

        public long ActionedByUserId { get; set; }
        public virtual User ActionedByUser { get; set; }
    }
}
