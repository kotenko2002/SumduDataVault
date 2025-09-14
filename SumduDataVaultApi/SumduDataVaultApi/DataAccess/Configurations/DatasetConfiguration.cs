using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SumduDataVaultApi.DataAccess.Entities;
using SumduDataVaultApi.DataAccess.Converters;

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
                .HasColumnType("jsonb")
                .HasConversion(new JArrayConverter());
        
            builder.Property(x => x.Description).IsRequired();
            builder.Property(x => x.CollectedFrom).HasColumnType("timestamptz");
            builder.Property(x => x.CollectedTo).HasColumnType("timestamptz");
            
            builder.Property(x => x.Metadata)
                .IsRequired()
                .HasColumnType("jsonb")
                .HasConversion(new JObjectConverter());

            builder.Property(x => x.CreatedAt).HasColumnType("timestamptz");
            builder.Property(x => x.UpdatedAt).HasColumnType("timestamptz");
        }
    }
}
