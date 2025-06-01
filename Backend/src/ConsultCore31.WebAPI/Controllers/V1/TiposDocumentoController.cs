using ConsultCore31.Application.DTOs.TipoDocumento;
using ConsultCore31.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace ConsultCore31.WebAPI.Controllers.V1
{
    /// <summary>
    /// Controlador para gestionar los tipos de documento
    /// </summary>
    [ApiVersion("1.0")]
    public class TiposDocumentoController : GenericController<TipoDocumentoDto, CreateTipoDocumentoDto, UpdateTipoDocumentoDto, int>
    {
        private readonly ITipoDocumentoService _tipoDocumentoService;

        /// <summary>
        /// Constructor que inicializa el controlador con el servicio y el logger
        /// </summary>
        /// <param name="tipoDocumentoService">Servicio de tipos de documento</param>
        /// <param name="logger">Logger para registro de eventos</param>
        public TiposDocumentoController(
            ITipoDocumentoService tipoDocumentoService,
            ILogger<TiposDocumentoController> logger)
            : base(tipoDocumentoService, logger, "tipo de documento")
        {
            _tipoDocumentoService = tipoDocumentoService;
        }

        /// <summary>
        /// Obtiene el ID del DTO
        /// </summary>
        /// <param name="dto">DTO del tipo de documento</param>
        /// <returns>ID del tipo de documento</returns>
        protected override int GetIdFromDto(TipoDocumentoDto dto)
        {
            return dto.Id;
        }

        /// <summary>
        /// Verifica si el ID de la ruta coincide con el ID del DTO
        /// </summary>
        /// <param name="id">ID de la ruta</param>
        /// <param name="updateDto">DTO de actualización</param>
        /// <returns>True si los IDs coinciden, False en caso contrario</returns>
        protected override bool IsIdMatchingDto(int id, UpdateTipoDocumentoDto updateDto)
        {
            return id == updateDto.Id;
        }
    }
}
