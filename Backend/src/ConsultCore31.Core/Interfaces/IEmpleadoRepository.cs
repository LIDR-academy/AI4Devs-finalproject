using ConsultCore31.Core.Entities;

namespace ConsultCore31.Core.Interfaces
{
    /// <summary>
    /// Interfaz para el repositorio de empleados
    /// </summary>
    public interface IEmpleadoRepository : IGenericRepository<Empleado, int>
    {
        // Aquí se pueden agregar métodos específicos para la entidad Empleado
    }
}