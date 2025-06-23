using AutoMapper;

using ConsultCore31.Application.DTOs.Cliente;
using ConsultCore31.Core.Entities;

namespace ConsultCore31.Application.Mappings
{
    /// <summary>
    /// Perfil de mapeo para la entidad Cliente
    /// </summary>
    public class ClienteProfile : Profile
    {
        /// <summary>
        /// Constructor que configura los mapeos
        /// </summary>
        public ClienteProfile()
        {
            // Mapeo de Cliente a ClienteDto
            CreateMap<Cliente, ClienteDto>()
                .ForMember(dest => dest.FechaCreacion, opt => opt.MapFrom(src => src.FechaCreacion))
                .ForMember(dest => dest.FechaModificacion, opt => opt.MapFrom(src => src.FechaModificacion));

            // Mapeo de CreateClienteDto a Cliente
            CreateMap<CreateClienteDto, Cliente>()
                .ForMember(dest => dest.FechaCreacion, opt => opt.Ignore())
                .ForMember(dest => dest.FechaModificacion, opt => opt.Ignore())
                .ForMember(dest => dest.Proyectos, opt => opt.Ignore())
                .ForMember(dest => dest.Contactos, opt => opt.Ignore())
                .ForMember(dest => dest.Objeto, opt => opt.Ignore());

            // Mapeo de UpdateClienteDto a Cliente
            CreateMap<UpdateClienteDto, Cliente>()
                .ForMember(dest => dest.FechaCreacion, opt => opt.Ignore())
                .ForMember(dest => dest.FechaModificacion, opt => opt.Ignore())
                .ForMember(dest => dest.Proyectos, opt => opt.Ignore())
                .ForMember(dest => dest.Contactos, opt => opt.Ignore())
                .ForMember(dest => dest.Objeto, opt => opt.Ignore());
        }
    }
}