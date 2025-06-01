using ConsultCore31.Application.DTOs.Tarea;

namespace ConsultCore31.Application.Interfaces
{
    /// <summary>
    /// Interfaz para el servicio de tareas
    /// </summary>
    public interface ITareaService : IGenericService<TareaDto, CreateTareaDto, UpdateTareaDto, int>
    {
        // Aquí se pueden agregar métodos específicos para el servicio de Tarea
    }
}
