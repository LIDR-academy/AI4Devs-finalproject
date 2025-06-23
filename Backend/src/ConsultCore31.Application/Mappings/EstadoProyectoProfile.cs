using AutoMapper;

using ConsultCore31.Application.DTOs.EstadoProyecto;
using ConsultCore31.Core.Entities;

namespace ConsultCore31.Application.Mappings
{
    /// <summary>
    /// Perfil de AutoMapper para mapear entre la entidad EstadoProyecto y sus DTOs
    /// </summary>
    public class EstadoProyectoProfile : Profile
    {
        /// <summary>
        /// Constructor que configura los mapeos
        /// </summary>
        public EstadoProyectoProfile()
        {
            // Mapeo de entidad a DTO
            CreateMap<EstadoProyecto, EstadoProyectoDto>()
                .ForMember(dest => dest.FechaCreacion, opt => opt.MapFrom(src => src.FechaCreacion))
                .ForMember(dest => dest.FechaModificacion, opt => opt.MapFrom(src => src.FechaModificacion));

            // Mapeo de DTO de creación a entidad
            CreateMap<CreateEstadoProyectoDto, EstadoProyecto>();

            // Mapeo de DTO de actualización a entidad
            CreateMap<UpdateEstadoProyectoDto, EstadoProyecto>();
        }
    }
}