using SumduDataVaultApi.DataAccess.Enums;

namespace SumduDataVaultApi.DataAccess.Entities
{
    public class ApprovalRequest : BaseEntity
    {
        public RequestType RequestType { get; set; }
        public RequestStatus Status { get; set; }
        public string UserJustification { get; set; }
        public string? AdminComments { get; set; }
        public DateTime RequestedAt { get; set; }
        public DateTime? ProcessedAt { get; set; }

        public long RequestingUserId { get; set; }
        public virtual User RequestingUser { get; set; }

        public long? DatasetId { get; set; }
        public virtual Dataset? Dataset { get; set; }

        public long? AdminId { get; set; }
        public virtual User? Admin { get; set; }

        public virtual ICollection<RequestHistory> History { get; set; }

        /// <summary>
        /// Перевіряє, чи є вказаний користувач власником цього запиту
        /// </summary>
        /// <param name="userId">ID користувача для перевірки</param>
        /// <returns>true, якщо користувач є власником запиту</returns>
        public bool IsOwner(long userId)
        {
            return RequestingUserId == userId;
        }
    }
}
