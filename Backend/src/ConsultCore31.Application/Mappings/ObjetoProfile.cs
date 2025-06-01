using ConsultCore31.Application.DTOs.Objeto;

using Profile = AutoMapper.Profile;

namespace ConsultCore31.Application.Mappings
{
    /// <summary>
    /// Perfil de mapeo para la entidad Objeto
    /// </summary>
    public class ObjetoProfile : Profile
    {
        public ObjetoProfile()
        {
            // Mapeo de Objeto a ObjetoDto
            CreateMap<Core.Entities.Objeto, ObjetoDto>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.Nombre, opt => opt.MapFrom(src => src.ObjetoNombre))
                .ForMember(dest => dest.Descripcion, opt => opt.MapFrom(src => src.ObjetoNombre)) // Usamos el nombre como descripción
                .ForMember(dest => dest.TipoObjetoId, opt => opt.MapFrom(src => src.ObjetoTipoId))
                .ForMember(dest => dest.TipoObjetoNombre, opt => opt.MapFrom(src => src.ObjetoTipo != null ? src.ObjetoTipo.ObjetoTipoNombre : string.Empty))
                .ForMember(dest => dest.Activo, opt => opt.MapFrom(src => src.ObjetoActivo));

            // Mapeo de CreateObjetoDto a Objeto
            CreateMap<CreateObjetoDto, Core.Entities.Objeto>()
                .ForMember(dest => dest.ObjetoNombre, opt => opt.MapFrom(src => src.Nombre))
                .ForMember(dest => dest.ObjetoTipoId, opt => opt.MapFrom(src => src.TipoObjetoId))
                .ForMember(dest => dest.ObjetoActivo, opt => opt.MapFrom(_ => true)); // Por defecto activo al crear

            // Mapeo de UpdateObjetoDto a Objeto
            CreateMap<UpdateObjetoDto, Core.Entities.Objeto>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.ObjetoNombre, opt => opt.MapFrom(src => src.Nombre))
                .ForMember(dest => dest.ObjetoTipoId, opt => opt.MapFrom(src => src.TipoObjetoId))
                .ForMember(dest => dest.ObjetoActivo, opt => opt.MapFrom(src => src.Activo));
        }
    }
}