using SumduDataVaultApi.Dtos;

namespace SumduDataVaultApi.Endpoints.Approval.View.GetRequestsList.Models
{
    public class GetRequestsListResponse
    {
        public List<ApprovalRequestDto> Requests { get; set; } = new();
        public int Total { get; set; }
    }
}
