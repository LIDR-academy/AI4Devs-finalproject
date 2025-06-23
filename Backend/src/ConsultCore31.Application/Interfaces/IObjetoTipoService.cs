using ConsultCore31.Application.DTOs.ObjetoTipo;

namespace ConsultCore31.Application.Interfaces
{
    /// <summary>
    /// Interfaz para el servicio de ObjetoTipo
    /// </summary>
    public interface IObjetoTipoService
    {
        /// <summary>
        /// Obtiene todos los tipos de objeto
        /// </summary>
        Task<IEnumerable<ObjetoTipoDto>> GetAllObjetoTiposAsync();

        /// <summary>
        /// Obtiene un tipo de objeto por su ID
        /// </summary>
        Task<ObjetoTipoDto> GetObjetoTipoByIdAsync(int id);

        /// <summary>
        /// Obtiene todos los tipos de objeto activos
        /// </summary>
        Task<IEnumerable<ObjetoTipoDto>> GetActiveObjetoTiposAsync();

        /// <summary>
        /// Crea un nuevo tipo de objeto
        /// </summary>
        Task<ObjetoTipoDto> CreateObjetoTipoAsync(CreateObjetoTipoDto createObjetoTipoDto);

        /// <summary>
        /// Actualiza un tipo de objeto existente
        /// </summary>
        Task<bool> UpdateObjetoTipoAsync(UpdateObjetoTipoDto updateObjetoTipoDto);

        /// <summary>
        /// Elimina un tipo de objeto por su ID
        /// </summary>
        Task<bool> DeleteObjetoTipoAsync(int id);
    }
}