using ConsultCore31.Application.DTOs.EstadoProyecto;
using ConsultCore31.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace ConsultCore31.WebAPI.Controllers.V1
{
    /// <summary>
    /// Controlador para gestionar los estados de proyecto
    /// </summary>
    [ApiVersion("1.0")]
    public class EstadosProyectoController : GenericController<EstadoProyectoDto, CreateEstadoProyectoDto, UpdateEstadoProyectoDto, int>
    {
        private readonly IEstadoProyectoService _estadoProyectoService;

        /// <summary>
        /// Constructor que inicializa el controlador con el servicio y el logger
        /// </summary>
        /// <param name="estadoProyectoService">Servicio de estados de proyecto</param>
        /// <param name="logger">Logger para registro de eventos</param>
        public EstadosProyectoController(
            IEstadoProyectoService estadoProyectoService,
            ILogger<EstadosProyectoController> logger)
            : base(estadoProyectoService, logger, "estado de proyecto")
        {
            _estadoProyectoService = estadoProyectoService;
        }

        /// <summary>
        /// Obtiene el ID del DTO
        /// </summary>
        /// <param name="dto">DTO del estado de proyecto</param>
        /// <returns>ID del estado de proyecto</returns>
        protected override int GetIdFromDto(EstadoProyectoDto dto)
        {
            return dto.Id;
        }

        /// <summary>
        /// Verifica si el ID de la ruta coincide con el ID del DTO
        /// </summary>
        /// <param name="id">ID de la ruta</param>
        /// <param name="updateDto">DTO de actualización</param>
        /// <returns>True si los IDs coinciden, False en caso contrario</returns>
        protected override bool IsIdMatchingDto(int id, UpdateEstadoProyectoDto updateDto)
        {
            return id == updateDto.Id;
        }
    }
}
