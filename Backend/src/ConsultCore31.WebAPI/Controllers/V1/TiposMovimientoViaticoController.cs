using Asp.Versioning;

using ConsultCore31.Application.DTOs.TipoMovimientoViatico;
using ConsultCore31.Application.Interfaces;

namespace ConsultCore31.WebAPI.Controllers.V1
{
    /// <summary>
    /// Controlador para gestionar los tipos de movimiento de viático
    /// </summary>
    [ApiVersion("1.0")]
    public class TiposMovimientoViaticoController : GenericController<TipoMovimientoViaticoDto, CreateTipoMovimientoViaticoDto, UpdateTipoMovimientoViaticoDto, int>
    {
        private readonly ITipoMovimientoViaticoService _tipoMovimientoViaticoService;

        /// <summary>
        /// Constructor que inicializa el controlador con el servicio y el logger
        /// </summary>
        /// <param name="tipoMovimientoViaticoService">Servicio de tipos de movimiento de viático</param>
        /// <param name="logger">Logger para registro de eventos</param>
        public TiposMovimientoViaticoController(
            ITipoMovimientoViaticoService tipoMovimientoViaticoService,
            ILogger<TiposMovimientoViaticoController> logger)
            : base(tipoMovimientoViaticoService, logger, "tipo de movimiento de viático")
        {
            _tipoMovimientoViaticoService = tipoMovimientoViaticoService;
        }

        /// <summary>
        /// Obtiene el ID del DTO
        /// </summary>
        /// <param name="dto">DTO del tipo de movimiento de viático</param>
        /// <returns>ID del tipo de movimiento de viático</returns>
        protected override int GetIdFromDto(TipoMovimientoViaticoDto dto)
        {
            return dto.Id;
        }

        /// <summary>
        /// Verifica si el ID de la ruta coincide con el ID del DTO
        /// </summary>
        /// <param name="id">ID de la ruta</param>
        /// <param name="updateDto">DTO de actualización</param>
        /// <returns>True si los IDs coinciden, False en caso contrario</returns>
        protected override bool IsIdMatchingDto(int id, UpdateTipoMovimientoViaticoDto updateDto)
        {
            return id == updateDto.Id;
        }
    }
}