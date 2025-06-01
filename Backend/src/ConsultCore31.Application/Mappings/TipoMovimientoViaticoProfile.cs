using AutoMapper;
using ConsultCore31.Application.DTOs.TipoMovimientoViatico;
using ConsultCore31.Core.Entities;

namespace ConsultCore31.Application.Mappings
{
    /// <summary>
    /// Perfil de AutoMapper para mapear entre la entidad TipoMovimientoViatico y sus DTOs
    /// </summary>
    public class TipoMovimientoViaticoProfile : Profile
    {
        /// <summary>
        /// Constructor que configura los mapeos
        /// </summary>
        public TipoMovimientoViaticoProfile()
        {
            // Mapeo de entidad a DTO
            CreateMap<TipoMovimientoViatico, TipoMovimientoViaticoDto>()
                .ForMember(dest => dest.FechaCreacion, opt => opt.MapFrom(src => src.FechaCreacion))
                .ForMember(dest => dest.FechaModificacion, opt => opt.MapFrom(src => src.FechaModificacion));

            // Mapeo de DTO de creación a entidad
            CreateMap<CreateTipoMovimientoViaticoDto, TipoMovimientoViatico>();

            // Mapeo de DTO de actualización a entidad
            CreateMap<UpdateTipoMovimientoViaticoDto, TipoMovimientoViatico>();
        }
    }
}
