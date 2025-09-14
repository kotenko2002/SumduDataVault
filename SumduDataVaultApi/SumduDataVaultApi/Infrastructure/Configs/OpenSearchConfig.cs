namespace SumduDataVaultApi.Infrastructure.Configs
{
    public class OpenSearchConfig
    {
        public required string[] Nodes { get; set; }
        public required string DefaultIndex { get; set; }
        public required OpenSearchCredentials Credentials { get; set; }
        public bool AllowInvalidCertificate { get; set; }
        public bool EnableDebugMode { get; set; }
    }

    public class OpenSearchCredentials
    {
        public required string Username { get; set; }
        public required string Password { get; set; }
    }
}
