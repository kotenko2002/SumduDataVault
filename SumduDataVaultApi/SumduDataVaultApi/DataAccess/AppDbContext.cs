using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SumduDataVaultApi.DataAccess.Entities;

namespace SumduDataVaultApi.DataAccess
{
    public class AppDbContext(DbContextOptions<AppDbContext> opts) : IdentityDbContext<User, IdentityRole<int>, int>(opts)
    {
        public virtual DbSet<Dataset> Dataset => Set<Dataset>();
        public virtual DbSet<DatasetMetadata> DatasetMetadata => Set<DatasetMetadata>();

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.ApplyConfigurationsFromAssembly(GetType().Assembly);

            base.OnModelCreating(builder);
        }
    }
}
