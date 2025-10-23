using Mapster;
using SumduDataVaultApi.DataAccess.Entities;

namespace SumduDataVaultApi.Dtos.Mapper
{
    public class ApprovalRequestMapper : IRegister
    {
        public void Register(TypeAdapterConfig config)
        {
            config.NewConfig<(ApprovalRequest req, bool isShortened), ApprovalRequestDto>()
                .Map(dest => dest.Id, src => src.req.Id)
                .Map(dest => dest.RequestType, src => src.req.RequestType)
                .Map(dest => dest.Status, src => src.req.Status.ToString())
                .Map(dest => dest.UserJustification, src => src.req.UserJustification)
                .Map(dest => dest.AdminComments, src => src.req.AdminComments)
                .Map(dest => dest.RequestedAt, src => src.req.RequestedAt)
                .Map(dest => dest.ProcessedAt, src => src.req.ProcessedAt)
                .Map(dest => dest.RequestingUserName, src => src.req.RequestingUser.GetFullName(src.isShortened))
                .Map(dest => dest.DatasetId, src => src.req.DatasetId)
                .Map(dest => dest.DatasetName, src => src.req.Dataset != null ? src.req.Dataset.FileName : null)
                .Map(dest => dest.AdminName, src => src.req.Admin != null ? src.req.Admin.GetFullName(src.isShortened) : null);
        }
    }
}
