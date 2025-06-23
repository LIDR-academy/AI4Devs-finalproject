using ConsultCore31.Application.DTOs.TipoDocumento;

namespace ConsultCore31.Application.Interfaces
{
    /// <summary>
    /// Interfaz para el servicio de tipos de documento
    /// </summary>
    public interface ITipoDocumentoService : IGenericService<TipoDocumentoDto, CreateTipoDocumentoDto, UpdateTipoDocumentoDto, int>
    {
        // Métodos específicos para TipoDocumento si son necesarios
    }
}