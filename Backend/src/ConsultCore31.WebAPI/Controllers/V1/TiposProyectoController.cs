using ConsultCore31.Application.DTOs.TipoProyecto;
using ConsultCore31.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace ConsultCore31.WebAPI.Controllers.V1
{
    /// <summary>
    /// Controlador para gestionar los tipos de proyecto
    /// </summary>
    [ApiVersion("1.0")]
    public class TiposProyectoController : GenericController<TipoProyectoDto, CreateTipoProyectoDto, UpdateTipoProyectoDto, int>
    {
        private readonly ITipoProyectoService _tipoProyectoService;

        /// <summary>
        /// Constructor que inicializa el controlador con el servicio y el logger
        /// </summary>
        /// <param name="tipoProyectoService">Servicio de tipos de proyecto</param>
        /// <param name="logger">Logger para registro de eventos</param>
        public TiposProyectoController(
            ITipoProyectoService tipoProyectoService,
            ILogger<TiposProyectoController> logger)
            : base(tipoProyectoService, logger, "tipo de proyecto")
        {
            _tipoProyectoService = tipoProyectoService;
        }

        /// <summary>
        /// Obtiene el ID del DTO
        /// </summary>
        /// <param name="dto">DTO del tipo de proyecto</param>
        /// <returns>ID del tipo de proyecto</returns>
        protected override int GetIdFromDto(TipoProyectoDto dto)
        {
            return dto.Id;
        }

        /// <summary>
        /// Verifica si el ID de la ruta coincide con el ID del DTO
        /// </summary>
        /// <param name="id">ID de la ruta</param>
        /// <param name="updateDto">DTO de actualización</param>
        /// <returns>True si los IDs coinciden, False en caso contrario</returns>
        protected override bool IsIdMatchingDto(int id, UpdateTipoProyectoDto updateDto)
        {
            return id == updateDto.Id;
        }
    }
}
