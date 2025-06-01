using ConsultCore31.Application.DTOs.UsuarioToken;

using Profile = AutoMapper.Profile;

namespace ConsultCore31.Application.Mappings
{
    /// <summary>
    /// Perfil de mapeo para la entidad UsuarioToken
    /// </summary>
    public class UsuarioTokenProfile : Profile
    {
        public UsuarioTokenProfile()
        {
            // Mapeo de UsuarioToken a UsuarioTokenDto
            CreateMap<Core.Entities.UsuarioToken, UsuarioTokenDto>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.JwtId, opt => opt.MapFrom(src => src.UsuarioJwtId))
                .ForMember(dest => dest.Usado, opt => opt.MapFrom(src => src.TokenUsado));

            // Mapeo de CreateUsuarioTokenDto a UsuarioToken
            CreateMap<CreateUsuarioTokenDto, Core.Entities.UsuarioToken>()
                .ForMember(dest => dest.UsuarioJwtId, opt => opt.MapFrom(src => src.JwtId))
                .ForMember(dest => dest.Token, opt => opt.MapFrom(src => src.Token))
                .ForMember(dest => dest.TokenUsado, opt => opt.MapFrom(_ => false))
                .ForMember(dest => dest.FechaCreacion, opt => opt.MapFrom(_ => DateTime.UtcNow))
                .ForMember(dest => dest.FechaExpiracion, opt => opt.MapFrom(src => src.FechaExpiracion));
        }
    }
}