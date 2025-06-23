using ConsultCore31.Core.Entities;

namespace ConsultCore31.Core.Interfaces
{
    /// <summary>
    /// Interfaz para el repositorio de Objeto
    /// </summary>
    public interface IObjetoRepository : IRepository<Objeto>
    {
        /// <summary>
        /// Obtiene un objeto por su nombre
        /// </summary>
        Task<Objeto> GetByNombreAsync(string nombre);

        /// <summary>
        /// Verifica si un objeto con el nombre dado ya existe
        /// </summary>
        Task<bool> ExistsByNombreAsync(string nombre, int? excludeId = null);

        /// <summary>
        /// Obtiene todos los objetos con información de su tipo
        /// </summary>
        Task<IEnumerable<Objeto>> GetAllWithTipoAsync();

        /// <summary>
        /// Obtiene un objeto con información de su tipo por ID
        /// </summary>
        Task<Objeto> GetByIdWithTipoAsync(int id);
    }
}