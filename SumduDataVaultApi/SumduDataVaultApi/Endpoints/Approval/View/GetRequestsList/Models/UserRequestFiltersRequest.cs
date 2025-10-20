using SumduDataVaultApi.DataAccess.Enums;

namespace SumduDataVaultApi.Endpoints.Approval.View.GetRequestsList.Models
{
    public class UserRequestFiltersRequest
    {
        public RequestType? RequestType { get; set; }
        public RequestStatus? Status { get; set; }
        public DateTime? CreatedFrom { get; set; }
        public DateTime? CreatedTo { get; set; }
        public int? Skip { get; set; }
        public int? Take { get; set; }
    }
}
