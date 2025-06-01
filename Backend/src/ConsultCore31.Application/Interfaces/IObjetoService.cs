using ConsultCore31.Application.DTOs.Objeto;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ConsultCore31.Application.Interfaces
{
    /// <summary>
    /// Interfaz para el servicio de Objeto
    /// </summary>
    public interface IObjetoService
    {
        /// <summary>
        /// Obtiene todos los objetos con información de su tipo
        /// </summary>
        Task<IEnumerable<ObjetoDto>> GetAllObjetosAsync();

        /// <summary>
        /// Obtiene un objeto con información de su tipo por ID
        /// </summary>
        Task<ObjetoDto> GetObjetoByIdAsync(int id);

        /// <summary>
        /// Crea un nuevo objeto
        /// </summary>
        Task<ObjetoDto> CreateObjetoAsync(CreateObjetoDto createObjetoDto);

        /// <summary>
        /// Actualiza un objeto existente
        /// </summary>
        Task<bool> UpdateObjetoAsync(UpdateObjetoDto updateObjetoDto);

        /// <summary>
        /// Elimina un objeto por su ID
        /// </summary>
        Task<bool> DeleteObjetoAsync(int id);
    }
}
