using ConsultCore31.Core.Entities;

namespace ConsultCore31.Core.Interfaces
{
    /// <summary>
    /// Interfaz para el repositorio de ObjetoTipo
    /// </summary>
    public interface IObjetoTipoRepository : IRepository<ObjetoTipo>
    {
        /// <summary>
        /// Obtiene un tipo de objeto por su nombre
        /// </summary>
        Task<ObjetoTipo> GetByNombreAsync(string nombre);

        /// <summary>
        /// Verifica si un tipo de objeto con el nombre dado ya existe
        /// </summary>
        Task<bool> ExistsByNombreAsync(string nombre, int? excludeId = null);

        /// <summary>
        /// Obtiene todos los tipos de objeto activos
        /// </summary>
        Task<IEnumerable<ObjetoTipo>> GetAllActiveAsync();
    }
}