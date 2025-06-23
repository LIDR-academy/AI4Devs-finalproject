using AutoMapper;

using ConsultCore31.Application.DTOs.Empleado;
using ConsultCore31.Core.Entities;

namespace ConsultCore31.Application.Mappings
{
    /// <summary>
    /// Perfil de mapeo para la entidad Empleado
    /// </summary>
    public class EmpleadoProfile : Profile
    {
        /// <summary>
        /// Constructor que configura los mapeos
        /// </summary>
        public EmpleadoProfile()
        {
            // Mapeo de Empleado a EmpleadoDto
            CreateMap<Empleado, EmpleadoDto>()
                .ForMember(dest => dest.FechaCreacion, opt => opt.MapFrom(src => src.FechaCreacion))
                .ForMember(dest => dest.FechaModificacion, opt => opt.MapFrom(src => src.FechaModificacion))
                .ForMember(dest => dest.NombrePuesto, opt => opt.MapFrom(src => src.Puesto != null ? src.Puesto.Nombre : null))
                .ForMember(dest => dest.NombreCompleto, opt => opt.Ignore()); // Se calcula en tiempo de ejecución

            // Mapeo de CreateEmpleadoDto a Empleado
            CreateMap<CreateEmpleadoDto, Empleado>()
                .ForMember(dest => dest.FechaCreacion, opt => opt.Ignore())
                .ForMember(dest => dest.FechaModificacion, opt => opt.Ignore())
                .ForMember(dest => dest.Puesto, opt => opt.Ignore())
                .ForMember(dest => dest.Objeto, opt => opt.Ignore())
                .ForMember(dest => dest.Usuario, opt => opt.Ignore());

            // Mapeo de UpdateEmpleadoDto a Empleado
            CreateMap<UpdateEmpleadoDto, Empleado>()
                .ForMember(dest => dest.FechaCreacion, opt => opt.Ignore())
                .ForMember(dest => dest.FechaModificacion, opt => opt.Ignore())
                .ForMember(dest => dest.Puesto, opt => opt.Ignore())
                .ForMember(dest => dest.Objeto, opt => opt.Ignore())
                .ForMember(dest => dest.Usuario, opt => opt.Ignore());
        }
    }
}