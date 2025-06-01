using ConsultCore31.Application.DTOs.Empleado;

namespace ConsultCore31.Application.Interfaces
{
    /// <summary>
    /// Interfaz para el servicio de empleados
    /// </summary>
    public interface IEmpleadoService : IGenericService<EmpleadoDto, CreateEmpleadoDto, UpdateEmpleadoDto, int>
    {
        // Aquí se pueden agregar métodos específicos para el servicio de Empleado
    }
}
