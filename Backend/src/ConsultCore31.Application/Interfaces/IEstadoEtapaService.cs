using ConsultCore31.Application.DTOs.EstadoEtapa;

namespace ConsultCore31.Application.Interfaces
{
    /// <summary>
    /// Interfaz para el servicio de estados de etapa
    /// </summary>
    public interface IEstadoEtapaService : IGenericService<EstadoEtapaDto, CreateEstadoEtapaDto, UpdateEstadoEtapaDto, int>
    {
        // Métodos específicos para EstadoEtapa si son necesarios
    }
}