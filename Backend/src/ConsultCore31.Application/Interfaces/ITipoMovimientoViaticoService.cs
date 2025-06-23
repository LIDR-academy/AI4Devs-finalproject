using ConsultCore31.Application.DTOs.TipoMovimientoViatico;

namespace ConsultCore31.Application.Interfaces
{
    /// <summary>
    /// Interfaz para el servicio de tipos de movimiento de viático
    /// </summary>
    public interface ITipoMovimientoViaticoService : IGenericService<TipoMovimientoViaticoDto, CreateTipoMovimientoViaticoDto, UpdateTipoMovimientoViaticoDto, int>
    {
        // Métodos específicos para TipoMovimientoViatico si son necesarios
    }
}