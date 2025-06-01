using AutoMapper;
using ConsultCore31.Application.DTOs.Puesto;
using ConsultCore31.Core.Entities;

namespace ConsultCore31.Application.Mappings
{
    /// <summary>
    /// Perfil de AutoMapper para mapear entre la entidad Puesto y sus DTOs
    /// </summary>
    public class PuestoProfile : Profile
    {
        /// <summary>
        /// Constructor que configura los mapeos
        /// </summary>
        public PuestoProfile()
        {
            // Mapeo de entidad a DTO
            CreateMap<Puesto, PuestoDto>()
                .ForMember(dest => dest.FechaCreacion, opt => opt.MapFrom(src => src.FechaCreacion))
                .ForMember(dest => dest.FechaModificacion, opt => opt.MapFrom(src => src.FechaModificacion));

            // Mapeo de DTO de creación a entidad
            CreateMap<CreatePuestoDto, Puesto>();

            // Mapeo de DTO de actualización a entidad
            CreateMap<UpdatePuestoDto, Puesto>();
        }
    }
}
