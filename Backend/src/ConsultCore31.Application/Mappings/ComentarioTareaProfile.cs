using AutoMapper;
using ConsultCore31.Application.DTOs.ComentarioTarea;
using ConsultCore31.Core.Entities;
using System;

namespace ConsultCore31.Application.Mappings
{
    /// <summary>
    /// Perfil de AutoMapper para mapear entre la entidad ComentarioTarea y sus DTOs
    /// </summary>
    public class ComentarioTareaProfile : Profile
    {
        /// <summary>
        /// Constructor que configura los mapeos
        /// </summary>
        public ComentarioTareaProfile()
        {
            // Mapeo de entidad a DTO de lectura
            CreateMap<ComentarioTarea, ComentarioTareaDto>()
                .ForMember(dest => dest.TareaTitulo, opt => opt.MapFrom(src => src.Tarea != null ? src.Tarea.Titulo : null))
                .ForMember(dest => dest.UsuarioNombre, opt => opt.MapFrom(src => src.Usuario != null ? $"{src.Usuario.UserName} {src.Usuario.UsuarioApellidos}" : null))
                .ForMember(dest => dest.FechaModificacion, opt => opt.MapFrom(src => src.FechaModificacion));

            // Mapeo de DTO de creación a entidad
            CreateMap<CreateComentarioTareaDto, ComentarioTarea>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.FechaCreacion, opt => opt.MapFrom(_ => DateTime.UtcNow))
                .ForMember(dest => dest.FechaModificacion, opt => opt.Ignore())
                .ForMember(dest => dest.Tarea, opt => opt.Ignore())
                .ForMember(dest => dest.Usuario, opt => opt.Ignore())
                .ForMember(dest => dest.ArchivosAdjuntos, opt => opt.Ignore())
                .ForMember(dest => dest.Activo, opt => opt.MapFrom(src => src.Activo));

            // Mapeo de DTO de actualización a entidad
            CreateMap<UpdateComentarioTareaDto, ComentarioTarea>()
                .ForMember(dest => dest.TareaId, opt => opt.Ignore())
                .ForMember(dest => dest.UsuarioId, opt => opt.Ignore())
                .ForMember(dest => dest.FechaCreacion, opt => opt.Ignore())
                .ForMember(dest => dest.FechaModificacion, opt => opt.MapFrom(_ => DateTime.UtcNow))
                .ForMember(dest => dest.Tarea, opt => opt.Ignore())
                .ForMember(dest => dest.Usuario, opt => opt.Ignore())
                .ForMember(dest => dest.ArchivosAdjuntos, opt => opt.Ignore());
        }
    }
}
