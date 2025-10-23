using Mapster;
using SumduDataVaultApi.DataAccess.Entities;
using SumduDataVaultApi.Endpoints.Auth.Register.Models;

namespace SumduDataVaultApi.Endpoints.Auth.Register
{
    public class RegisterMapper : IRegister
    {
        public void Register(TypeAdapterConfig config)
        {
            config.NewConfig<RegisterRequest, User>()
                .Map(dest => dest.Email, src => src.Email)
                .Map(dest => dest.UserName, src => src.Email)
                .Map(dest => dest.FirstName, src => src.FirstName)
                .Map(dest => dest.LastName, src => src.LastName)
                .Map(dest => dest.MiddleName, src => src.MiddleName)
                .Map(dest => dest.SecurityStamp, src => Guid.NewGuid().ToString());
        }
    }
}
