using AutoMapper;
using ConsultCore31.Application.DTOs.PrioridadTarea;
using ConsultCore31.Core.Entities;

namespace ConsultCore31.Application.Mappings
{
    /// <summary>
    /// Perfil de AutoMapper para mapear entre la entidad PrioridadTarea y sus DTOs
    /// </summary>
    public class PrioridadTareaProfile : Profile
    {
        /// <summary>
        /// Constructor que configura los mapeos
        /// </summary>
        public PrioridadTareaProfile()
        {
            // Mapeo de entidad a DTO
            CreateMap<PrioridadTarea, PrioridadTareaDto>()
                .ForMember(dest => dest.FechaCreacion, opt => opt.MapFrom(src => src.FechaCreacion))
                .ForMember(dest => dest.FechaModificacion, opt => opt.MapFrom(src => src.FechaModificacion));

            // Mapeo de DTO de creación a entidad
            CreateMap<CreatePrioridadTareaDto, PrioridadTarea>();

            // Mapeo de DTO de actualización a entidad
            CreateMap<UpdatePrioridadTareaDto, PrioridadTarea>();
        }
    }
}
