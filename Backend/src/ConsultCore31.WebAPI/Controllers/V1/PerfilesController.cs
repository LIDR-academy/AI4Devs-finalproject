using Asp.Versioning;

using ConsultCore31.Application.DTOs.Perfil;
using ConsultCore31.Application.Interfaces;

using Microsoft.AspNetCore.Mvc;

namespace ConsultCore31.WebAPI.Controllers.V1
{
    /// <summary>
    /// Controlador para la gestión de perfiles
    /// </summary>
    [ApiVersion("1.0")]
    public class PerfilesController : GenericController<PerfilDto, CreatePerfilDto, UpdatePerfilDto, int>
    {
        private readonly IPerfilService _perfilService;

        /// <summary>
        /// Constructor que inicializa el controlador con el servicio y el logger
        /// </summary>
        /// <param name="perfilService">Servicio de perfiles</param>
        /// <param name="logger">Logger para registro de eventos</param>
        public PerfilesController(
            IPerfilService perfilService,
            ILogger<PerfilesController> logger)
            : base(perfilService, logger, "perfil")
        {
            _perfilService = perfilService;
        }

        /// <summary>
        /// Obtiene todos los perfiles, con opción de incluir inactivos
        /// </summary>
        /// <param name="includeInactive">Si es true, incluye también los perfiles inactivos</param>
        /// <returns>Lista de perfiles</returns>
        [HttpGet("all")]
        [ProducesResponseType(typeof(IEnumerable<PerfilDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAllWithInactive([FromQuery] bool includeInactive = false)
        {
            _logger.LogInformation($"GetAllWithInactive llamado con includeInactive={includeInactive}");

            var result = await _perfilService.GetAllWithInactiveAsync(includeInactive);
            _logger.LogInformation($"GetAllWithInactive devolvió {result.Count()} registros");

            return Ok(result);
        }

        /// <summary>
        /// Obtiene el ID del DTO
        /// </summary>
        /// <param name="dto">DTO del perfil</param>
        /// <returns>ID del perfil</returns>
        protected override int GetIdFromDto(PerfilDto dto)
        {
            return dto.Id;
        }

        /// <summary>
        /// Verifica si el ID de la ruta coincide con el ID del DTO
        /// </summary>
        /// <param name="id">ID de la ruta</param>
        /// <param name="updateDto">DTO de actualización</param>
        /// <returns>True si los IDs coinciden, False en caso contrario</returns>
        protected override bool IsIdMatchingDto(int id, UpdatePerfilDto updateDto)
        {
            return id == updateDto.Id;
        }
    }
}