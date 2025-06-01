using AutoMapper;
using ConsultCore31.Application.DTOs.TipoProyecto;
using ConsultCore31.Core.Entities;

namespace ConsultCore31.Application.Mappings
{
    /// <summary>
    /// Perfil de AutoMapper para mapear entre la entidad TipoProyecto y sus DTOs
    /// </summary>
    public class TipoProyectoProfile : Profile
    {
        /// <summary>
        /// Constructor que configura los mapeos
        /// </summary>
        public TipoProyectoProfile()
        {
            // Mapeo de entidad a DTO
            CreateMap<TipoProyecto, TipoProyectoDto>()
                .ForMember(dest => dest.FechaCreacion, opt => opt.MapFrom(src => src.FechaCreacion))
                .ForMember(dest => dest.FechaModificacion, opt => opt.MapFrom(src => src.FechaModificacion));

            // Mapeo de DTO de creación a entidad
            CreateMap<CreateTipoProyectoDto, TipoProyecto>();

            // Mapeo de DTO de actualización a entidad
            CreateMap<UpdateTipoProyectoDto, TipoProyecto>();
        }
    }
}
