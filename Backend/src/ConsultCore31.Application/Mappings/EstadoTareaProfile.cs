using AutoMapper;

using ConsultCore31.Application.DTOs.EstadoTarea;
using ConsultCore31.Core.Entities;

namespace ConsultCore31.Application.Mappings
{
    /// <summary>
    /// Perfil de AutoMapper para mapear entre la entidad EstadoTarea y sus DTOs
    /// </summary>
    public class EstadoTareaProfile : Profile
    {
        /// <summary>
        /// Constructor que configura los mapeos
        /// </summary>
        public EstadoTareaProfile()
        {
            // Mapeo de entidad a DTO
            CreateMap<EstadoTarea, EstadoTareaDto>()
                .ForMember(dest => dest.FechaCreacion, opt => opt.MapFrom(src => src.FechaCreacion))
                .ForMember(dest => dest.FechaModificacion, opt => opt.MapFrom(src => src.FechaModificacion));

            // Mapeo de DTO de creación a entidad
            CreateMap<CreateEstadoTareaDto, EstadoTarea>();

            // Mapeo de DTO de actualización a entidad
            CreateMap<UpdateEstadoTareaDto, EstadoTarea>();
        }
    }
}