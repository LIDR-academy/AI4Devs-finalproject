using ConsultCore31.Application.DTOs.EstadoAprobacion;
using ConsultCore31.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace ConsultCore31.WebAPI.Controllers.V1
{
    /// <summary>
    /// Controlador para gestionar los estados de aprobación
    /// </summary>
    [ApiVersion("1.0")]
    public class EstadosAprobacionController : GenericController<EstadoAprobacionDto, CreateEstadoAprobacionDto, UpdateEstadoAprobacionDto, int>
    {
        private readonly IEstadoAprobacionService _estadoAprobacionService;

        /// <summary>
        /// Constructor que inicializa el controlador con el servicio y el logger
        /// </summary>
        /// <param name="estadoAprobacionService">Servicio de estados de aprobación</param>
        /// <param name="logger">Logger para registro de eventos</param>
        public EstadosAprobacionController(
            IEstadoAprobacionService estadoAprobacionService,
            ILogger<EstadosAprobacionController> logger)
            : base(estadoAprobacionService, logger, "estado de aprobación")
        {
            _estadoAprobacionService = estadoAprobacionService;
        }

        /// <summary>
        /// Obtiene el ID del DTO
        /// </summary>
        /// <param name="dto">DTO del estado de aprobación</param>
        /// <returns>ID del estado de aprobación</returns>
        protected override int GetIdFromDto(EstadoAprobacionDto dto)
        {
            return dto.Id;
        }

        /// <summary>
        /// Verifica si el ID de la ruta coincide con el ID del DTO
        /// </summary>
        /// <param name="id">ID de la ruta</param>
        /// <param name="updateDto">DTO de actualización</param>
        /// <returns>True si los IDs coinciden, False en caso contrario</returns>
        protected override bool IsIdMatchingDto(int id, UpdateEstadoAprobacionDto updateDto)
        {
            return id == updateDto.Id;
        }
    }
}
