using AutoMapper;
using ConsultCore31.Application.DTOs.EstadoEtapa;
using ConsultCore31.Core.Entities;

namespace ConsultCore31.Application.Mappings
{
    /// <summary>
    /// Perfil de AutoMapper para mapear entre la entidad EstadoEtapa y sus DTOs
    /// </summary>
    public class EstadoEtapaProfile : Profile
    {
        /// <summary>
        /// Constructor que configura los mapeos
        /// </summary>
        public EstadoEtapaProfile()
        {
            // Mapeo de entidad a DTO
            CreateMap<EstadoEtapa, EstadoEtapaDto>()
                .ForMember(dest => dest.FechaCreacion, opt => opt.MapFrom(src => src.FechaCreacion))
                .ForMember(dest => dest.FechaModificacion, opt => opt.MapFrom(src => src.FechaModificacion));

            // Mapeo de DTO de creación a entidad
            CreateMap<CreateEstadoEtapaDto, EstadoEtapa>();

            // Mapeo de DTO de actualización a entidad
            CreateMap<UpdateEstadoEtapaDto, EstadoEtapa>();
        }
    }
}
