using ConsultCore31.Application.DTOs.TipoDocumento;

namespace ConsultCore31.Application.Interfaces
{
    /// <summary>
    /// Interfaz para el servicio de tipos de documento
    /// </summary>
    public interface ITipoDocumentoService : IGenericService<TipoDocumentoDto, CreateTipoDocumentoDto, UpdateTipoDocumentoDto, int>
    {
        /// <summary>
        /// Obtiene todos los tipos de documento, incluyendo los inactivos
        /// </summary>
        /// <param name="includeInactive">Si es true, incluye también los tipos inactivos</param>
        /// <param name="cancellationToken">Token de cancelación</param>
        /// <returns>Lista de tipos de documento</returns>
        Task<IEnumerable<TipoDocumentoDto>> GetAllWithInactiveAsync(bool includeInactive = false, CancellationToken cancellationToken = default);
    }
}