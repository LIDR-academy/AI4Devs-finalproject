using AutoMapper;

using ConsultCore31.Application.DTOs.EstadoAprobacion;
using ConsultCore31.Core.Entities;

namespace ConsultCore31.Application.Mappings
{
    /// <summary>
    /// Perfil de AutoMapper para mapear entre la entidad EstadoAprobacion y sus DTOs
    /// </summary>
    public class EstadoAprobacionProfile : Profile
    {
        /// <summary>
        /// Constructor que configura los mapeos
        /// </summary>
        public EstadoAprobacionProfile()
        {
            // Mapeo de entidad a DTO
            CreateMap<EstadoAprobacion, EstadoAprobacionDto>()
                .ForMember(dest => dest.FechaCreacion, opt => opt.MapFrom(src => src.FechaCreacion))
                .ForMember(dest => dest.FechaModificacion, opt => opt.MapFrom(src => src.FechaModificacion));

            // Mapeo de DTO de creación a entidad
            CreateMap<CreateEstadoAprobacionDto, EstadoAprobacion>();

            // Mapeo de DTO de actualización a entidad
            CreateMap<UpdateEstadoAprobacionDto, EstadoAprobacion>();
        }
    }
}