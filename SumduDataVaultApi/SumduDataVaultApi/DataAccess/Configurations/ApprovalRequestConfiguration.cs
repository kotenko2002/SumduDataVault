using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SumduDataVaultApi.DataAccess.Entities;

namespace SumduDataVaultApi.DataAccess.Configurations
{
    public class ApprovalRequestConfiguration : BaseEntityConfiguration<ApprovalRequest>
    {
        public override void Configure(EntityTypeBuilder<ApprovalRequest> builder)
        {
            base.Configure(builder);

            builder.Property(e => e.Status).IsRequired();
            builder.Property(e => e.RequestType).IsRequired();

            builder.HasOne(e => e.RequestingUser)
                .WithMany() // Assuming User doesn't have a navigation property back
                .HasForeignKey(e => e.RequestingUserId)
                .IsRequired();

            builder.HasOne(e => e.Admin)
                .WithMany()
                .HasForeignKey(e => e.AdminId)
                .IsRequired(false); // AdminId is nullable

            builder.HasOne(e => e.Dataset)
                .WithMany()
                .HasForeignKey(e => e.DatasetId)
                .IsRequired(false); // DatasetId is nullable
        }
    }
}
