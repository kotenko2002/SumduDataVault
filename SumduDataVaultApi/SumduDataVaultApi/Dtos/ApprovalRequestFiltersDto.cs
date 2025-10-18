using SumduDataVaultApi.DataAccess.Enums;

namespace SumduDataVaultApi.Dtos
{
    public class ApprovalRequestFiltersDto
    {
        public RequestType? RequestType { get; set; }
        public RequestStatus? Status { get; set; }
        public DateTime? CreatedFrom { get; set; }
        public DateTime? CreatedTo { get; set; }
        public int? Skip { get; set; }
        public int? Take { get; set; }
    }
}
