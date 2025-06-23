using AutoMapper;

using ConsultCore31.Application.DTOs.TipoKPI;
using ConsultCore31.Core.Entities;

namespace ConsultCore31.Application.Mappings
{
    /// <summary>
    /// Perfil de AutoMapper para mapear entre la entidad TipoKPI y sus DTOs
    /// </summary>
    public class TipoKPIProfile : Profile
    {
        /// <summary>
        /// Constructor que configura los mapeos
        /// </summary>
        public TipoKPIProfile()
        {
            // Mapeo de entidad a DTO
            CreateMap<TipoKPI, TipoKPIDto>()
                .ForMember(dest => dest.FechaCreacion, opt => opt.MapFrom(src => src.FechaCreacion))
                .ForMember(dest => dest.FechaModificacion, opt => opt.MapFrom(src => src.FechaModificacion));

            // Mapeo de DTO de creación a entidad
            CreateMap<CreateTipoKPIDto, TipoKPI>();

            // Mapeo de DTO de actualización a entidad
            CreateMap<UpdateTipoKPIDto, TipoKPI>();
        }
    }
}