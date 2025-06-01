using AutoMapper;
using ConsultCore31.Application.DTOs.Tarea;
using ConsultCore31.Core.Entities;

namespace ConsultCore31.Application.Mappings
{
    /// <summary>
    /// Perfil de AutoMapper para la entidad Tarea
    /// </summary>
    public class TareaProfile : Profile
    {
        /// <summary>
        /// Constructor que configura los mapeos para la entidad Tarea
        /// </summary>
        public TareaProfile()
        {
            // Mapeo de Tarea a TareaDto
            CreateMap<Tarea, TareaDto>()
                .ForMember(dest => dest.ProyectoNombre, opt => opt.MapFrom(src => src.Proyecto != null ? src.Proyecto.Nombre : null))
                .ForMember(dest => dest.EtapaProyectoNombre, opt => opt.MapFrom(src => src.EtapaProyecto != null ? src.EtapaProyecto.Nombre : null))
                .ForMember(dest => dest.EstadoTareaNombre, opt => opt.MapFrom(src => src.EstadoTarea != null ? src.EstadoTarea.Nombre : null))
                .ForMember(dest => dest.PrioridadTareaNombre, opt => opt.MapFrom(src => src.PrioridadTarea != null ? src.PrioridadTarea.Nombre : null))
                .ForMember(dest => dest.CreadoPorNombre, opt => opt.MapFrom(src => src.CreadoPor != null ? $"{src.CreadoPor.UserName} {src.CreadoPor.UsuarioApellidos}" : null))
                .ForMember(dest => dest.AsignadoANombre, opt => opt.MapFrom(src => src.AsignadoA != null ? $"{src.AsignadoA.UserName} {src.AsignadoA.UsuarioApellidos}" : null))
                .ForMember(dest => dest.FechaCreacion, opt => opt.MapFrom(src => src.FechaCreacion))
                .ForMember(dest => dest.FechaModificacion, opt => opt.MapFrom(src => src.FechaModificacion));

            // Mapeo de CreateTareaDto a Tarea
            CreateMap<CreateTareaDto, Tarea>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.FechaCreacion, opt => opt.Ignore())
                .ForMember(dest => dest.FechaModificacion, opt => opt.Ignore())
                .ForMember(dest => dest.CreadoPor, opt => opt.Ignore())
                // La entidad Tarea no tiene ModificadoPor
                .ForMember(dest => dest.Activa, opt => opt.MapFrom(src => src.Activa))
                .ForMember(dest => dest.Proyecto, opt => opt.Ignore())
                .ForMember(dest => dest.EtapaProyecto, opt => opt.Ignore())
                .ForMember(dest => dest.EstadoTarea, opt => opt.Ignore())
                .ForMember(dest => dest.PrioridadTarea, opt => opt.Ignore())
                .ForMember(dest => dest.AsignadoA, opt => opt.Ignore())
                .ForMember(dest => dest.Comentarios, opt => opt.Ignore())
                .ForMember(dest => dest.ArchivosAdjuntos, opt => opt.Ignore());

            // Mapeo de UpdateTareaDto a Tarea
            CreateMap<UpdateTareaDto, Tarea>()
                .ForMember(dest => dest.FechaCreacion, opt => opt.Ignore())
                .ForMember(dest => dest.FechaModificacion, opt => opt.Ignore())
                .ForMember(dest => dest.CreadoPor, opt => opt.Ignore())
                // La entidad Tarea no tiene ModificadoPor
                .ForMember(dest => dest.CreadoPorId, opt => opt.Ignore())
                .ForMember(dest => dest.Activa, opt => opt.MapFrom(src => src.Activa))
                .ForMember(dest => dest.Proyecto, opt => opt.Ignore())
                .ForMember(dest => dest.EtapaProyecto, opt => opt.Ignore())
                .ForMember(dest => dest.EstadoTarea, opt => opt.Ignore())
                .ForMember(dest => dest.PrioridadTarea, opt => opt.Ignore())
                .ForMember(dest => dest.AsignadoA, opt => opt.Ignore())
                .ForMember(dest => dest.Comentarios, opt => opt.Ignore())
                .ForMember(dest => dest.ArchivosAdjuntos, opt => opt.Ignore());
        }
    }
}
