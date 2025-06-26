using Asp.Versioning;

using ConsultCore31.Application.DTOs.TipoKPI;
using ConsultCore31.Application.Interfaces;

namespace ConsultCore31.WebAPI.Controllers.V1
{
    /// <summary>
    /// Controlador para gestionar los tipos de KPI
    /// </summary>
    [ApiVersion("1.0")]
    public class TiposKPIController : GenericController<TipoKPIDto, CreateTipoKPIDto, UpdateTipoKPIDto, int>
    {
        private readonly ITipoKPIService _tipoKPIService;

        /// <summary>
        /// Constructor que inicializa el controlador con el servicio y el logger
        /// </summary>
        /// <param name="tipoKPIService">Servicio de tipos de KPI</param>
        /// <param name="logger">Logger para registro de eventos</param>
        public TiposKPIController(
            ITipoKPIService tipoKPIService,
            ILogger<TiposKPIController> logger)
            : base(tipoKPIService, logger, "tipo de KPI")
        {
            _tipoKPIService = tipoKPIService;
        }

        /// <summary>
        /// Obtiene el ID del DTO
        /// </summary>
        /// <param name="dto">DTO del tipo de KPI</param>
        /// <returns>ID del tipo de KPI</returns>
        protected override int GetIdFromDto(TipoKPIDto dto)
        {
            return dto.Id;
        }

        /// <summary>
        /// Verifica si el ID de la ruta coincide con el ID del DTO
        /// </summary>
        /// <param name="id">ID de la ruta</param>
        /// <param name="updateDto">DTO de actualización</param>
        /// <returns>True si los IDs coinciden, False en caso contrario</returns>
        protected override bool IsIdMatchingDto(int id, UpdateTipoKPIDto updateDto)
        {
            return id == updateDto.Id;
        }
    }
}