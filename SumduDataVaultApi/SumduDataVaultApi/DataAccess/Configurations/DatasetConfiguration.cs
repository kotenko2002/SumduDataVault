using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SumduDataVaultApi.DataAccess.Entities;

namespace SumduDataVaultApi.DataAccess.Configurations
{
    public sealed class DatasetConfiguration : BaseEntityConfiguration<Dataset>
    {
        public override void Configure(EntityTypeBuilder<Dataset> builder)
        {
            base.Configure(builder);

            builder.Property(x => x.FileName).IsRequired();
            builder.Property(x => x.ChecksumSha256).IsRequired();
            builder.Property(x => x.CsvContent).IsRequired().HasColumnType("bytea");
            builder.Property(x => x.RowCount).IsRequired();
            builder.Property(x => x.FileSizeBytes).IsRequired();

            builder.Property(x => x.PreviewLines)
                .IsRequired()
                .HasColumnType("jsonb");
        
            builder.Property(x => x.Description).IsRequired();
            builder.Property(x => x.CollectedFrom).HasColumnType("timestamptz");
            builder.Property(x => x.CollectedTo).HasColumnType("timestamptz");
            
            builder.Property(x => x.Metadata)
                .IsRequired()
                .HasColumnType("jsonb");

            builder.Property(x => x.CreatedAt).HasColumnType("timestamptz");
            builder.Property(x => x.UpdatedAt).HasColumnType("timestamptz");

            builder.HasMany(x => x.MetadataItems)
                   .WithOne()
                   .HasForeignKey(x => x.DatasetId)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
