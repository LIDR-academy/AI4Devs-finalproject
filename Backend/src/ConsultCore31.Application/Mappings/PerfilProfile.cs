using ConsultCore31.Application.DTOs.Perfil;

using Profile = AutoMapper.Profile;

namespace ConsultCore31.Application.Mappings
{
    /// <summary>
    /// Perfil de mapeo para la entidad Perfil
    /// </summary>
    public class PerfilProfile : Profile
    {
        public PerfilProfile()
        {
            // Mapeo de Perfil a PerfilDto
            CreateMap<Core.Entities.Perfil, PerfilDto>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.Nombre, opt => opt.MapFrom(src => src.PerfilNombre))
                .ForMember(dest => dest.Descripcion, opt => opt.MapFrom(src => src.PerfilDescripcion)) // Usamos PerfilNombre como descripción
                .ForMember(dest => dest.Activo, opt => opt.MapFrom(src => src.PerfilActivo));

            // Mapeo de CreatePerfilDto a Perfil
            CreateMap<CreatePerfilDto, Core.Entities.Perfil>()
                .ForMember(dest => dest.PerfilNombre, opt => opt.MapFrom(src => src.Nombre))
                .ForMember(dest => dest.PerfilDescripcion, opt => opt.MapFrom(src => src.Descripcion))
                .ForMember(dest => dest.PerfilActivo, opt => opt.MapFrom(src => src.Activo)); // Por defecto activo al crear

            // Mapeo de UpdatePerfilDto a Perfil
            CreateMap<UpdatePerfilDto, Core.Entities.Perfil>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.PerfilNombre, opt => opt.MapFrom(src => src.Nombre))
                .ForMember(dest => dest.PerfilDescripcion, opt => opt.MapFrom(src => src.Descripcion))
                .ForMember(dest => dest.PerfilActivo, opt => opt.MapFrom(src => src.Activo));
        }
    }
}