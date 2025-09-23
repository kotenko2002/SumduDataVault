using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SumduDataVaultApi.DataAccess.Entities;

namespace SumduDataVaultApi.DataAccess.Configurations
{
    public sealed class DatasetMetadataConfiguration : BaseEntityConfiguration<DatasetMetadata>
    {
        public override void Configure(EntityTypeBuilder<DatasetMetadata> builder)
        {
            base.Configure(builder);

            builder.Property(x => x.DatasetId).IsRequired();
            builder.Property(x => x.Field).IsRequired().HasMaxLength(255);
            builder.Property(x => x.Value).IsRequired().HasMaxLength(1000);

            builder.HasIndex(x => x.Field);
            builder.HasIndex(x => x.Value);
            
            builder.HasIndex(x => new { x.Field, x.Value });
        }
    }
}
