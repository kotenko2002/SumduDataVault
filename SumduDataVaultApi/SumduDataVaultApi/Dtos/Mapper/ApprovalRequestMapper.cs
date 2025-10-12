using Mapster;
using SumduDataVaultApi.DataAccess.Entities;
using SumduDataVaultApi.Dtos;

namespace SumduDataVaultApi.Dtos.Mapper
{
    public class ApprovalRequestMapper : IRegister
    {
        public void Register(TypeAdapterConfig config)
        {
            config.NewConfig<ApprovalRequest, ApprovalRequestDto>()
                .Map(dest => dest.Id, src => src.Id)
                .Map(dest => dest.RequestType, src => src.RequestType)
                .Map(dest => dest.Status, src => src.Status.ToString())
                .Map(dest => dest.UserJustification, src => src.UserJustification)
                .Map(dest => dest.AdminComments, src => src.AdminComments)
                .Map(dest => dest.RequestedAt, src => src.RequestedAt)
                .Map(dest => dest.ProcessedAt, src => src.ProcessedAt)
                .Map(dest => dest.RequestingUserName, src => $"{src.RequestingUser.FirstName} {src.RequestingUser.LastName}")
                .Map(dest => dest.DatasetId, src => src.DatasetId)
                .Map(dest => dest.DatasetName, src => src.Dataset != null ? src.Dataset.FileName : null)
                .Map(dest => dest.AdminName, src => src.Admin != null ? $"{src.Admin.FirstName} {src.Admin.LastName}" : null);
        }
    }
}
