using ConsultCore31.Core.Entities;

namespace ConsultCore31.Core.Interfaces
{
    /// <summary>
    /// Interfaz para el repositorio de Perfil
    /// </summary>
    public interface IPerfilRepository : IRepository<Perfil>
    {
        /// <summary>
        /// Obtiene todos los perfiles activos
        /// </summary>
        Task<IEnumerable<Perfil>> GetPerfilesActivosAsync();

        /// <summary>
        /// Obtiene un perfil con sus relaciones por ID
        /// </summary>
        Task<Perfil> GetPerfilConRelacionesAsync(int id);

        /// <summary>
        /// Obtiene un perfil por su nombre
        /// </summary>
        Task<Perfil> GetByNombreAsync(string nombre);

        /// <summary>
        /// Verifica si un perfil con el nombre dado ya existe
        /// </summary>
        Task<bool> ExistsByNombreAsync(string nombre, int? excludeId = null);
    }
}