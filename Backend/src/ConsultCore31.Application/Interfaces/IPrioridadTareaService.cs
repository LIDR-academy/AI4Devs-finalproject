using ConsultCore31.Application.DTOs.PrioridadTarea;

namespace ConsultCore31.Application.Interfaces
{
    /// <summary>
    /// Interfaz para el servicio de prioridades de tarea
    /// </summary>
    public interface IPrioridadTareaService : IGenericService<PrioridadTareaDto, CreatePrioridadTareaDto, UpdatePrioridadTareaDto, int>
    {
        // Métodos específicos para PrioridadTarea si son necesarios
    }
}
