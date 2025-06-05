using Asp.Versioning;

using ConsultCore31.Application.DTOs.Tarea;
using ConsultCore31.Application.Interfaces;

namespace ConsultCore31.WebAPI.Controllers.V1
{
    /// <summary>
    /// Controlador para gestionar las tareas
    /// </summary>
    [ApiVersion("1.0")]
    public class TareasController : GenericController<TareaDto, CreateTareaDto, UpdateTareaDto, int>
    {
        private readonly ITareaService _tareaService;

        /// <summary>
        /// Constructor
        /// </summary>
        public TareasController(
            ITareaService tareaService,
            ILogger<TareasController> logger)
            : base(tareaService, logger, "tarea")
        {
            _tareaService = tareaService;
        }

        /// <summary>
        /// Obtiene el ID de la entidad desde el DTO
        /// </summary>
        protected override int GetIdFromDto(TareaDto dto)
        {
            return dto.Id;
        }

        /// <summary>
        /// Verifica si el ID de la ruta coincide con el ID del DTO
        /// </summary>
        protected override bool IsIdMatchingDto(int id, UpdateTareaDto updateDto)
        {
            return id == updateDto.Id;
        }
    }
}