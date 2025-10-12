using Stateless;
using SumduDataVaultApi.DataAccess;
using SumduDataVaultApi.DataAccess.Entities;
using SumduDataVaultApi.DataAccess.Enums;

namespace SumduDataVaultApi.Services.Approvals
{
    public class ApprovalService : IApprovalService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<ApprovalService> _logger;

        public ApprovalService(AppDbContext context, ILogger<ApprovalService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<ApprovalRequest> CreateRequestAsync(long userId, RequestType requestType, string justification, long? datasetId = null)
        {
            var request = new ApprovalRequest
            {
                RequestType = requestType,
                Status = RequestStatus.Pending,
                UserJustification = justification,
                RequestedAt = DateTime.UtcNow,
                RequestingUserId = userId,
                DatasetId = datasetId,
                History = new List<RequestHistory>()
            };

            _context.ApprovalRequest.Add(request);
            await _context.SaveChangesAsync();

            var initialHistory = new RequestHistory
            {
                FromState = RequestStatus.Pending,
                ToState = RequestStatus.Pending,
                Comments = "Запит створено",
                Timestamp = DateTime.UtcNow,
                ApprovalRequestId = request.Id,
                ActionedByUserId = userId
            };

            _context.RequestHistory.Add(initialHistory);
            await _context.SaveChangesAsync();

            return request;
        }


        public async Task<bool> ApproveRequestAsync(ApprovalRequest request, long adminId, string comments)
        {
            var machine = ConfigureStateMachine(request);

            if (!machine.CanFire(RequestTrigger.Approve))
            {
                _logger.LogWarning("Неможливо схвалити запит {RequestId} зі стану {Status}", request.Id, request.Status);
                return false;
            }

            request.AdminId = adminId;
            request.AdminComments = comments;
            await machine.FireAsync(RequestTrigger.Approve);

            return true;
        }

        public async Task<bool> RejectRequestAsync(ApprovalRequest request, long adminId, string comments)
        {
            var machine = ConfigureStateMachine(request);

            if (!machine.CanFire(RequestTrigger.Reject))
            {
                _logger.LogWarning("Неможливо відхилити запит {RequestId} зі стану {Status}", request.Id, request.Status);
                return false;
            }

            request.AdminId = adminId;
            request.AdminComments = comments;
            await machine.FireAsync(RequestTrigger.Reject);

            return true;
        }

        public async Task<bool> CancelRequestAsync(ApprovalRequest request, long userId)
        {
            if (!request.IsOwner(userId))
            {
                _logger.LogWarning("Користувач {UserId} намагається скасувати чужий запит {RequestId}", userId, request.Id);
                return false;
            }

            var machine = ConfigureStateMachine(request);

            if (!machine.CanFire(RequestTrigger.Cancel))
            {
                _logger.LogWarning("Неможливо скасувати запит {RequestId} зі стану {Status}", request.Id, request.Status);
                return false;
            }

            await machine.FireAsync(RequestTrigger.Cancel);

            return true;
        }

        private StateMachine<RequestStatus, RequestTrigger> ConfigureStateMachine(ApprovalRequest request)
        {
            var machine = new StateMachine<RequestStatus, RequestTrigger>(
                () => request.Status,
                s => request.Status = s
            );

            machine.Configure(RequestStatus.Pending)
                .Permit(RequestTrigger.Approve, RequestStatus.Approved)
                .Permit(RequestTrigger.Reject, RequestStatus.Rejected)
                .Permit(RequestTrigger.Cancel, RequestStatus.Canceled);

            machine.Configure(RequestStatus.Approved)
                .OnEntry(_ => { request.ProcessedAt = DateTime.UtcNow; });

            machine.Configure(RequestStatus.Rejected)
                .OnEntry(_ => { request.ProcessedAt = DateTime.UtcNow; });

            machine.Configure(RequestStatus.Canceled)
                .OnEntry(_ => { request.ProcessedAt = DateTime.UtcNow; });

            return machine;
        }
    }
}
