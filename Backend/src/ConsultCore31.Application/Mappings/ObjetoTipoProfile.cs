using ConsultCore31.Application.DTOs.ObjetoTipo;

using Profile = AutoMapper.Profile;

namespace ConsultCore31.Application.Mappings.ObjetoTipo
{
    /// <summary>
    /// Perfil de mapeo para la entidad ObjetoTipo
    /// </summary>
    public class ObjetoTipoProfile : Profile
    {
        public ObjetoTipoProfile()
        {
            // Mapeo de ObjetoTipo a ObjetoTipoDto
            CreateMap<Core.Entities.ObjetoTipo, ObjetoTipoDto>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.Nombre, opt => opt.MapFrom(src => src.ObjetoTipoNombre))
                .ForMember(dest => dest.Descripcion, opt => opt.MapFrom(src => src.ObjetoTipoNombre)) // Usamos el nombre como descripción
                .ForMember(dest => dest.Activo, opt => opt.MapFrom(src => true)); // Siempre activo

            // Mapeo de CreateObjetoTipoDto a ObjetoTipo
            CreateMap<CreateObjetoTipoDto, Core.Entities.ObjetoTipo>()
                .ForMember(dest => dest.ObjetoTipoNombre, opt => opt.MapFrom(src => src.Nombre));

            // Mapeo de UpdateObjetoTipoDto a ObjetoTipo
            CreateMap<UpdateObjetoTipoDto, Core.Entities.ObjetoTipo>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.ObjetoTipoNombre, opt => opt.MapFrom(src => src.Nombre));
        }
    }
}