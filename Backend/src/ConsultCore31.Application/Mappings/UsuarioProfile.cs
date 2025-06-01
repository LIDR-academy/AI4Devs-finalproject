using AutoMapper;

using ConsultCore31.Application.DTOs.Usuario;

namespace ConsultCore31.Application.Mappings
{
    /// <summary>
    /// Perfil de mapeo para la entidad Usuario
    /// </summary>
    public class UsuarioProfile : Profile
    {
        public UsuarioProfile()
        {
            // Mapeo de Core.Entities.Usuario a UsuarioDto
            CreateMap<Core.Entities.Usuario, UsuarioDto>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.Nombre, opt => opt.MapFrom(src => src.UserName))
                .ForMember(dest => dest.Apellidos, opt => opt.MapFrom(src => src.UsuarioApellidos))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email))
                .ForMember(dest => dest.Movil, opt => opt.MapFrom(src => src.PhoneNumber))
                .ForMember(dest => dest.PerfilId, opt => opt.MapFrom(src => src.PerfilId))
                .ForMember(dest => dest.EmpleadoId, opt => opt.MapFrom(src => src.EmpleadoId))
                .ForMember(dest => dest.ObjetoId, opt => opt.MapFrom(src => src.ObjetoId))
                .ForMember(dest => dest.Activo, opt => opt.MapFrom(src => src.UsuarioActivo));

            // Mapeo de CreateUsuarioDto a Core.Entities.Usuario
            CreateMap<CreateUsuarioDto, Core.Entities.Usuario>()
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.Nombre))
                .ForMember(dest => dest.UsuarioApellidos, opt => opt.MapFrom(src => src.Apellidos))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email))
                .ForMember(dest => dest.PhoneNumber, opt => opt.MapFrom(src => src.Movil))
                .ForMember(dest => dest.PerfilId, opt => opt.MapFrom(src => src.PerfilId))
                .ForMember(dest => dest.EmpleadoId, opt => opt.MapFrom(src => src.EmpleadoId))
                .ForMember(dest => dest.ObjetoId, opt => opt.MapFrom(src => src.ObjetoId))
                .ForMember(dest => dest.UsuarioActivo, opt => opt.MapFrom(src => true)); // Por defecto activo al crear

            // Mapeo de UpdateUsuarioDto a Core.Entities.Usuario
            CreateMap<UpdateUsuarioDto, Core.Entities.Usuario>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.Nombre))
                .ForMember(dest => dest.UsuarioApellidos, opt => opt.MapFrom(src => src.Apellidos))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email))
                .ForMember(dest => dest.PhoneNumber, opt => opt.MapFrom(src => src.Movil))
                .ForMember(dest => dest.PerfilId, opt => opt.MapFrom(src => src.PerfilId))
                .ForMember(dest => dest.EmpleadoId, opt => opt.MapFrom(src => src.EmpleadoId))
                .ForMember(dest => dest.ObjetoId, opt => opt.MapFrom(src => src.ObjetoId))
                .ForMember(dest => dest.UsuarioActivo, opt => opt.MapFrom(src => src.Activo));
        }
    }
}