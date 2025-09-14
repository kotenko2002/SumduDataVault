namespace SumduDataVaultApi.Infrastructure.Configs
{
    public class OpenSearchConfig
    {
        public required string[] Nodes { get; set; }
        public required string DefaultIndex { get; set; }
        public required string Username { get; set; }
        public required string Password { get; set; }
        public bool AllowInvalidCertificate { get; set; }
        public bool EnableDebugMode { get; set; }
    }
}
