namespace SumduDataVaultApi.Endpoints.Users.SearchUsers.Models
{
    public sealed record SearchUsersRequest
    {
        public required string Search { get; init; }
    }
}
