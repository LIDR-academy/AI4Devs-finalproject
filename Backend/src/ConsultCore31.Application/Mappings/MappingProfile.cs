using AutoMapper;

using ConsultCore31.Application.DTOs.Common;
using ConsultCore31.Core.Entities;

namespace ConsultCore31.Application.Mappings
{
    /// <summary>
    /// Perfil de mapeo para AutoMapper
    /// </summary>
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // Configuración de mapeos generales
            CreateMap<Entity, BaseDto>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.FechaCreacion, opt => opt.MapFrom(src => src.CreatedAt))
                .ForMember(dest => dest.FechaModificacion, opt => opt.MapFrom(src => src.UpdatedAt));

            // Los mapeos específicos para cada entidad se definirán en clases derivadas
        }
    }
}