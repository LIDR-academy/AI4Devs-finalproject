using ConsultCore31.Application.DTOs.EstadoAprobacion;

namespace ConsultCore31.Application.Interfaces
{
    /// <summary>
    /// Interfaz para el servicio de estados de aprobación
    /// </summary>
    public interface IEstadoAprobacionService : IGenericService<EstadoAprobacionDto, CreateEstadoAprobacionDto, UpdateEstadoAprobacionDto, int>
    {
        // Métodos específicos para EstadoAprobacion si son necesarios
    }
}
