using ConsultCore31.Application.DTOs.PrioridadTarea;
using ConsultCore31.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace ConsultCore31.WebAPI.Controllers.V1
{
    /// <summary>
    /// Controlador para gestionar las prioridades de tarea
    /// </summary>
    [ApiVersion("1.0")]
    public class PrioridadesTareaController : GenericController<PrioridadTareaDto, CreatePrioridadTareaDto, UpdatePrioridadTareaDto, int>
    {
        private readonly IPrioridadTareaService _prioridadTareaService;

        /// <summary>
        /// Constructor que inicializa el controlador con el servicio y el logger
        /// </summary>
        /// <param name="prioridadTareaService">Servicio de prioridades de tarea</param>
        /// <param name="logger">Logger para registro de eventos</param>
        public PrioridadesTareaController(
            IPrioridadTareaService prioridadTareaService,
            ILogger<PrioridadesTareaController> logger)
            : base(prioridadTareaService, logger, "prioridad de tarea")
        {
            _prioridadTareaService = prioridadTareaService;
        }

        /// <summary>
        /// Obtiene el ID del DTO
        /// </summary>
        /// <param name="dto">DTO de la prioridad de tarea</param>
        /// <returns>ID de la prioridad de tarea</returns>
        protected override int GetIdFromDto(PrioridadTareaDto dto)
        {
            return dto.Id;
        }

        /// <summary>
        /// Verifica si el ID de la ruta coincide con el ID del DTO
        /// </summary>
        /// <param name="id">ID de la ruta</param>
        /// <param name="updateDto">DTO de actualización</param>
        /// <returns>True si los IDs coinciden, False en caso contrario</returns>
        protected override bool IsIdMatchingDto(int id, UpdatePrioridadTareaDto updateDto)
        {
            return id == updateDto.Id;
        }
    }
}
