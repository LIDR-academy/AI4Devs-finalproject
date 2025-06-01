using ConsultCore31.Application.DTOs.Acceso;
using ConsultCore31.Core.Entities;

using Profile = AutoMapper.Profile;

namespace ConsultCore31.Application.Mappings
{
    /// <summary>
    /// Perfil de mapeo para la entidad Acceso
    /// </summary>
    public class AccesoProfile : Profile
    {
        public AccesoProfile()
        {
            // Mapeo de Acceso a AccesoDto
            CreateMap<Acceso, AccesoDto>()
                .ForMember(dest => dest.PerfilNombre, opt => opt.MapFrom(src => src.Perfil != null ? src.Perfil.PerfilNombre : string.Empty))
                .ForMember(dest => dest.ObjetoNombre, opt => opt.MapFrom(src => src.Objeto != null ? src.Objeto.ObjetoNombre : string.Empty))
                .ForMember(dest => dest.ObjetoTipoNombre, opt => opt.MapFrom(src => src.Objeto != null && src.Objeto.ObjetoTipo != null ? src.Objeto.ObjetoTipo.ObjetoTipoNombre : string.Empty));

            // Mapeo de CreateOrUpdateAccesoDto a Acceso
            CreateMap<CreateOrUpdateAccesoDto, Acceso>();

            // Mapeo para actualización de entidad existente
            CreateMap<AccesoDto, Acceso>()
                .ForMember(dest => dest.Perfil, opt => opt.Ignore())
                .ForMember(dest => dest.Objeto, opt => opt.Ignore());
        }
    }
}