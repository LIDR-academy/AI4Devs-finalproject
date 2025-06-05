using Asp.Versioning;

using ConsultCore31.Application.DTOs.Moneda;
using ConsultCore31.Application.Interfaces;

namespace ConsultCore31.WebAPI.Controllers.V1
{
    /// <summary>
    /// Controlador para gestionar las monedas
    /// </summary>
    [ApiVersion("1.0")]
    public class MonedasController : GenericController<MonedaDto, CreateMonedaDto, UpdateMonedaDto, int>
    {
        private readonly IMonedaService _monedaService;

        /// <summary>
        /// Constructor que inicializa el controlador con el servicio y el logger
        /// </summary>
        /// <param name="monedaService">Servicio de monedas</param>
        /// <param name="logger">Logger para registro de eventos</param>
        public MonedasController(
            IMonedaService monedaService,
            ILogger<MonedasController> logger)
            : base(monedaService, logger, "moneda")
        {
            _monedaService = monedaService;
        }

        /// <summary>
        /// Obtiene el ID del DTO
        /// </summary>
        /// <param name="dto">DTO de la moneda</param>
        /// <returns>ID de la moneda</returns>
        protected override int GetIdFromDto(MonedaDto dto)
        {
            return dto.Id;
        }

        /// <summary>
        /// Verifica si el ID de la ruta coincide con el ID del DTO
        /// </summary>
        /// <param name="id">ID de la ruta</param>
        /// <param name="updateDto">DTO de actualización</param>
        /// <returns>True si los IDs coinciden, False en caso contrario</returns>
        protected override bool IsIdMatchingDto(int id, UpdateMonedaDto updateDto)
        {
            return id == updateDto.Id;
        }
    }
}