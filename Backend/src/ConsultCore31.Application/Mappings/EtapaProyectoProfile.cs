using AutoMapper;
using ConsultCore31.Application.DTOs.EtapaProyecto;
using ConsultCore31.Core.Entities;

namespace ConsultCore31.Application.Mappings
{
    /// <summary>
    /// Perfil de AutoMapper para la entidad EtapaProyecto
    /// </summary>
    public class EtapaProyectoProfile : Profile
    {
        /// <summary>
        /// Constructor que configura los mapeos para la entidad EtapaProyecto
        /// </summary>
        public EtapaProyectoProfile()
        {
            // Mapeo de EtapaProyecto a EtapaProyectoDto
            CreateMap<EtapaProyecto, EtapaProyectoDto>()
                .ForMember(dest => dest.EstadoEtapaNombre, opt => opt.MapFrom(src => src.EstadoEtapa != null ? src.EstadoEtapa.Nombre : null))
                .ForMember(dest => dest.FechaCreacion, opt => opt.MapFrom(src => src.FechaCreacion))
                .ForMember(dest => dest.FechaModificacion, opt => opt.MapFrom(src => src.FechaModificacion));

            // Mapeo de CreateEtapaProyectoDto a EtapaProyecto
            CreateMap<CreateEtapaProyectoDto, EtapaProyecto>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.FechaCreacion, opt => opt.Ignore())
                .ForMember(dest => dest.FechaModificacion, opt => opt.Ignore())
                .ForMember(dest => dest.Activa, opt => opt.MapFrom(src => src.Activa))
                .ForMember(dest => dest.Proyecto, opt => opt.Ignore())
                .ForMember(dest => dest.EstadoEtapa, opt => opt.Ignore())
                .ForMember(dest => dest.Tareas, opt => opt.Ignore())
                .ForMember(dest => dest.Documentos, opt => opt.Ignore());

            // Mapeo de UpdateEtapaProyectoDto a EtapaProyecto
            CreateMap<UpdateEtapaProyectoDto, EtapaProyecto>()
                .ForMember(dest => dest.FechaCreacion, opt => opt.Ignore())
                .ForMember(dest => dest.FechaModificacion, opt => opt.Ignore())
                .ForMember(dest => dest.Activa, opt => opt.MapFrom(src => src.Activa))
                .ForMember(dest => dest.Proyecto, opt => opt.Ignore())
                .ForMember(dest => dest.EstadoEtapa, opt => opt.Ignore())
                .ForMember(dest => dest.Tareas, opt => opt.Ignore())
                .ForMember(dest => dest.Documentos, opt => opt.Ignore());
        }
    }
}
