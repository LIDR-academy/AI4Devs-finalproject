using AutoMapper;
using ConsultCore31.Application.DTOs.CategoriaGasto;
using ConsultCore31.Core.Entities;

namespace ConsultCore31.Application.Mappings
{
    /// <summary>
    /// Perfil de mapeo para CategoriaGasto
    /// </summary>
    public class CategoriaGastoProfile : Profile
    {
        public CategoriaGastoProfile()
        {
            // Mapeo de entidad a DTO
            CreateMap<CategoriaGasto, CategoriaGastoDto>();

            // Mapeo de DTO de creación a entidad
            CreateMap<CreateCategoriaGastoDto, CategoriaGasto>();

            // Mapeo de DTO de actualización a entidad
            CreateMap<UpdateCategoriaGastoDto, CategoriaGasto>();
        }
    }
}
