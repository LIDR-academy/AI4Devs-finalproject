using ConsultCore31.Application.DTOs.CategoriaGasto;

namespace ConsultCore31.Application.Interfaces
{
    /// <summary>
    /// Interfaz para el servicio de categorías de gasto
    /// </summary>
    public interface ICategoriaGastoService : IGenericService<CategoriaGastoDto, CreateCategoriaGastoDto, UpdateCategoriaGastoDto, int>
    {
        // Métodos específicos para CategoriaGasto si son necesarios
    }
}