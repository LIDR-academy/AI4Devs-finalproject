using ConsultCore31.Application.DTOs.ComentarioTarea;

namespace ConsultCore31.Application.Interfaces
{
    /// <summary>
    /// Interfaz para el servicio de comentarios de tarea
    /// </summary>
    public interface IComentarioTareaService : IGenericService<ComentarioTareaDto, CreateComentarioTareaDto, UpdateComentarioTareaDto, int>
    {
        // Aquí se pueden agregar métodos específicos para el servicio de ComentarioTarea
    }
}
