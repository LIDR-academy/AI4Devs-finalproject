using AutoMapper;

using ConsultCore31.Application.DTOs.Moneda;
using ConsultCore31.Core.Entities;

namespace ConsultCore31.Application.Mappings
{
    /// <summary>
    /// Perfil de AutoMapper para mapear entre la entidad Moneda y sus DTOs
    /// </summary>
    public class MonedaProfile : Profile
    {
        /// <summary>
        /// Constructor que configura los mapeos
        /// </summary>
        public MonedaProfile()
        {
            // Mapeo de entidad a DTO
            CreateMap<Moneda, MonedaDto>()
                .ForMember(dest => dest.FechaCreacion, opt => opt.MapFrom(src => src.FechaCreacion))
                .ForMember(dest => dest.FechaModificacion, opt => opt.MapFrom(src => src.FechaModificacion));

            // Mapeo de DTO de creación a entidad
            CreateMap<CreateMonedaDto, Moneda>();

            // Mapeo de DTO de actualización a entidad
            CreateMap<UpdateMonedaDto, Moneda>();
        }
    }
}