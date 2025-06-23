using ConsultCore31.Core.Entities;

namespace ConsultCore31.Core.Interfaces
{
    /// <summary>
    /// Interfaz para el repositorio de proyectos
    /// </summary>
    public interface IProyectoRepository : IGenericRepository<Proyecto, int>
    {
        // Aquí se pueden agregar métodos específicos para la entidad Proyecto
    }
}