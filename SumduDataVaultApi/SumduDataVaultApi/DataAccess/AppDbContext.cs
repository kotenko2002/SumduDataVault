using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SumduDataVaultApi.DataAccess.Entities;

namespace SumduDataVaultApi.DataAccess
{
    public class AppDbContext(DbContextOptions<AppDbContext> opts) : IdentityDbContext<User, IdentityRole<long>, long>(opts)
    {
        public virtual DbSet<Dataset> Dataset => Set<Dataset>();
        public virtual DbSet<DatasetMetadata> DatasetMetadata => Set<DatasetMetadata>();
        public virtual DbSet<ApprovalRequest> ApprovalRequest => Set<ApprovalRequest>();
        public virtual DbSet<RequestHistory> RequestHistory => Set<RequestHistory>();

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.ApplyConfigurationsFromAssembly(GetType().Assembly);

            base.OnModelCreating(builder);
        }
    }
}
