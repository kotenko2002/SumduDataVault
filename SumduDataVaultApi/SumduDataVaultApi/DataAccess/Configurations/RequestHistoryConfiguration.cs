using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SumduDataVaultApi.DataAccess.Entities;

namespace SumduDataVaultApi.DataAccess.Configurations
{
    public class RequestHistoryConfiguration : BaseEntityConfiguration<RequestHistory>
    {
        public override void Configure(EntityTypeBuilder<RequestHistory> builder)
        {
            base.Configure(builder);


            builder.HasOne(e => e.ApprovalRequest)
                .WithMany(r => r.History) // One-to-many relationship
                .HasForeignKey(e => e.ApprovalRequestId)
                .IsRequired();

            builder.HasOne(e => e.ActionedByUser)
                .WithMany()
                .HasForeignKey(e => e.ActionedByUserId)
                .IsRequired();
        }
    }
}
