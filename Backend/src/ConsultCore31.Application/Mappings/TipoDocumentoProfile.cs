using AutoMapper;
using ConsultCore31.Application.DTOs.TipoDocumento;
using ConsultCore31.Core.Entities;

namespace ConsultCore31.Application.Mappings
{
    /// <summary>
    /// Perfil de AutoMapper para mapear entre la entidad TipoDocumento y sus DTOs
    /// </summary>
    public class TipoDocumentoProfile : Profile
    {
        /// <summary>
        /// Constructor que configura los mapeos
        /// </summary>
        public TipoDocumentoProfile()
        {
            // Mapeo de entidad a DTO
            CreateMap<TipoDocumento, TipoDocumentoDto>()
                .ForMember(dest => dest.FechaCreacion, opt => opt.MapFrom(src => src.FechaCreacion))
                .ForMember(dest => dest.FechaModificacion, opt => opt.MapFrom(src => src.FechaModificacion));

            // Mapeo de DTO de creación a entidad
            CreateMap<CreateTipoDocumentoDto, TipoDocumento>();

            // Mapeo de DTO de actualización a entidad
            CreateMap<UpdateTipoDocumentoDto, TipoDocumento>();
        }
    }
}
