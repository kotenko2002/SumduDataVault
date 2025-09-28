namespace SumduDataVaultApi.Infrastructure.Configs
{
    public class JwtConfig
    {
        public string Secret { get; set; } = string.Empty;
        public string ValidIssuer { get; set; } = string.Empty;
        public string ValidAudience { get; set; } = string.Empty;
        public int TokenValidityInDays { get; set; }
    }
}
