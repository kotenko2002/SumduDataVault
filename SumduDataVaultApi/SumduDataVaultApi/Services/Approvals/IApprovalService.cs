using SumduDataVaultApi.DataAccess.Entities;
using SumduDataVaultApi.DataAccess.Enums;

namespace SumduDataVaultApi.Services.Approvals
{
    public interface IApprovalService
    {
        Task<ApprovalRequest> CreateRequestAsync(long userId, RequestType requestType, string justification, long? datasetId = null);
        Task<bool> ApproveRequestAsync(ApprovalRequest request, long adminId, string comments);
        Task<bool> RejectRequestAsync(ApprovalRequest request, long adminId, string comments);
        Task<bool> CancelRequestAsync(ApprovalRequest request, long userId);
    }
}
