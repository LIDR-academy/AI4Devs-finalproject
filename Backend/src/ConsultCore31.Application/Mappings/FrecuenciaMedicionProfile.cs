using AutoMapper;

using ConsultCore31.Application.DTOs.FrecuenciaMedicion;
using ConsultCore31.Core.Entities;

namespace ConsultCore31.Application.Mappings
{
    /// <summary>
    /// Perfil de AutoMapper para mapear entre la entidad FrecuenciaMedicion y sus DTOs
    /// </summary>
    public class FrecuenciaMedicionProfile : Profile
    {
        /// <summary>
        /// Constructor que configura los mapeos
        /// </summary>
        public FrecuenciaMedicionProfile()
        {
            // Mapeo de entidad a DTO
            CreateMap<FrecuenciaMedicion, FrecuenciaMedicionDto>()
                .ForMember(dest => dest.FechaCreacion, opt => opt.MapFrom(src => src.FechaCreacion))
                .ForMember(dest => dest.FechaModificacion, opt => opt.MapFrom(src => src.FechaModificacion));

            // Mapeo de DTO de creación a entidad
            CreateMap<CreateFrecuenciaMedicionDto, FrecuenciaMedicion>();

            // Mapeo de DTO de actualización a entidad
            CreateMap<UpdateFrecuenciaMedicionDto, FrecuenciaMedicion>();
        }
    }
}