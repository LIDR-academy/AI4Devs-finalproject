using Asp.Versioning;

using ConsultCore31.Application.DTOs.EstadoTarea;
using ConsultCore31.Application.Interfaces;

namespace ConsultCore31.WebAPI.Controllers.V1
{
    /// <summary>
    /// Controlador para gestionar los estados de tarea
    /// </summary>
    [ApiVersion("1.0")]
    public class EstadosTareaController : GenericController<EstadoTareaDto, CreateEstadoTareaDto, UpdateEstadoTareaDto, int>
    {
        private readonly IEstadoTareaService _estadoTareaService;

        /// <summary>
        /// Constructor que inicializa el controlador con el servicio y el logger
        /// </summary>
        /// <param name="estadoTareaService">Servicio de estados de tarea</param>
        /// <param name="logger">Logger para registro de eventos</param>
        public EstadosTareaController(
            IEstadoTareaService estadoTareaService,
            ILogger<EstadosTareaController> logger)
            : base(estadoTareaService, logger, "estado de tarea")
        {
            _estadoTareaService = estadoTareaService;
        }

        /// <summary>
        /// Obtiene el ID del DTO
        /// </summary>
        /// <param name="dto">DTO del estado de tarea</param>
        /// <returns>ID del estado de tarea</returns>
        protected override int GetIdFromDto(EstadoTareaDto dto)
        {
            return dto.Id;
        }

        /// <summary>
        /// Verifica si el ID de la ruta coincide con el ID del DTO
        /// </summary>
        /// <param name="id">ID de la ruta</param>
        /// <param name="updateDto">DTO de actualización</param>
        /// <returns>True si los IDs coinciden, False en caso contrario</returns>
        protected override bool IsIdMatchingDto(int id, UpdateEstadoTareaDto updateDto)
        {
            return id == updateDto.Id;
        }
    }
}