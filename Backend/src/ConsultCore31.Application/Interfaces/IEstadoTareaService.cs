using ConsultCore31.Application.DTOs.EstadoTarea;

namespace ConsultCore31.Application.Interfaces
{
    /// <summary>
    /// Interfaz para el servicio de estados de tarea
    /// </summary>
    public interface IEstadoTareaService : IGenericService<EstadoTareaDto, CreateEstadoTareaDto, UpdateEstadoTareaDto, int>
    {
        // Métodos específicos para EstadoTarea si son necesarios
    }
}