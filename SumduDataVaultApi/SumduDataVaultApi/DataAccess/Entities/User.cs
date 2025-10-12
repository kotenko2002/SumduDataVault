using Microsoft.AspNetCore.Identity;

namespace SumduDataVaultApi.DataAccess.Entities
{
    public class User : IdentityUser<long>
    {
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
    }

    public static class Roles
    {
        public const string Admin = "Admin";
        public const string Client = "Client";
    }
}
