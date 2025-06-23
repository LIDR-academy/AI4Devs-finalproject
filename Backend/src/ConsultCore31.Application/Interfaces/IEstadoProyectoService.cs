using ConsultCore31.Application.DTOs.EstadoProyecto;

namespace ConsultCore31.Application.Interfaces
{
    /// <summary>
    /// Interfaz para el servicio de estados de proyecto
    /// </summary>
    public interface IEstadoProyectoService : IGenericService<EstadoProyectoDto, CreateEstadoProyectoDto, UpdateEstadoProyectoDto, int>
    {
        // Métodos específicos para EstadoProyecto si son necesarios
    }
}