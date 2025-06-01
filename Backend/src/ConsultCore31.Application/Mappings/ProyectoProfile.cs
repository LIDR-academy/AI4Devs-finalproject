using AutoMapper;
using ConsultCore31.Application.DTOs.Proyecto;
using ConsultCore31.Core.Entities;

namespace ConsultCore31.Application.Mappings
{
    /// <summary>
    /// Perfil de mapeo para la entidad Proyecto
    /// </summary>
    public class ProyectoProfile : Profile
    {
        /// <summary>
        /// Constructor que configura los mapeos
        /// </summary>
        public ProyectoProfile()
        {
            // Mapeo de Proyecto a ProyectoDto
            CreateMap<Proyecto, ProyectoDto>()
                .ForMember(dest => dest.FechaCreacion, opt => opt.MapFrom(src => src.FechaCreacion))
                .ForMember(dest => dest.FechaModificacion, opt => opt.MapFrom(src => src.FechaModificacion))
                .ForMember(dest => dest.EstadoProyectoNombre, opt => opt.MapFrom(src => src.EstadoProyecto != null ? src.EstadoProyecto.Nombre : null))
                .ForMember(dest => dest.TipoProyectoNombre, opt => opt.MapFrom(src => src.TipoProyecto != null ? src.TipoProyecto.Nombre : null))
                .ForMember(dest => dest.ClienteNombre, opt => opt.MapFrom(src => src.Cliente != null ? src.Cliente.Nombre : null))
                .ForMember(dest => dest.GerenteNombre, opt => opt.MapFrom(src => src.Gerente != null ? $"{src.Gerente.UserName} {src.Gerente.UsuarioApellidos}" : null));

            // Mapeo de CreateProyectoDto a Proyecto
            CreateMap<CreateProyectoDto, Proyecto>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.FechaCreacion, opt => opt.Ignore())
                .ForMember(dest => dest.FechaModificacion, opt => opt.Ignore())
                .ForMember(dest => dest.FechaFinReal, opt => opt.Ignore())
                .ForMember(dest => dest.PorcentajeAvance, opt => opt.Ignore())
                .ForMember(dest => dest.EstadoProyecto, opt => opt.Ignore())
                .ForMember(dest => dest.TipoProyecto, opt => opt.Ignore())
                .ForMember(dest => dest.Cliente, opt => opt.Ignore())
                .ForMember(dest => dest.Gerente, opt => opt.Ignore())
                .ForMember(dest => dest.Objeto, opt => opt.Ignore())
                .ForMember(dest => dest.EtapasProyecto, opt => opt.Ignore())
                .ForMember(dest => dest.Tareas, opt => opt.Ignore())
                .ForMember(dest => dest.Documentos, opt => opt.Ignore())
                .ForMember(dest => dest.KPIs, opt => opt.Ignore())
                .ForMember(dest => dest.Gastos, opt => opt.Ignore())
                .ForMember(dest => dest.AsignacionesViatico, opt => opt.Ignore())
                .ForMember(dest => dest.InformesSemanales, opt => opt.Ignore());

            // Mapeo de UpdateProyectoDto a Proyecto
            CreateMap<UpdateProyectoDto, Proyecto>()
                .ForMember(dest => dest.FechaCreacion, opt => opt.Ignore())
                .ForMember(dest => dest.FechaModificacion, opt => opt.Ignore())
                .ForMember(dest => dest.EstadoProyecto, opt => opt.Ignore())
                .ForMember(dest => dest.TipoProyecto, opt => opt.Ignore())
                .ForMember(dest => dest.Cliente, opt => opt.Ignore())
                .ForMember(dest => dest.Gerente, opt => opt.Ignore())
                .ForMember(dest => dest.Objeto, opt => opt.Ignore())
                .ForMember(dest => dest.EtapasProyecto, opt => opt.Ignore())
                .ForMember(dest => dest.Tareas, opt => opt.Ignore())
                .ForMember(dest => dest.Documentos, opt => opt.Ignore())
                .ForMember(dest => dest.KPIs, opt => opt.Ignore())
                .ForMember(dest => dest.Gastos, opt => opt.Ignore())
                .ForMember(dest => dest.AsignacionesViatico, opt => opt.Ignore())
                .ForMember(dest => dest.InformesSemanales, opt => opt.Ignore());
        }
    }
}
