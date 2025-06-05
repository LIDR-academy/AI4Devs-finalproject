using Asp.Versioning;

using ConsultCore31.Application.DTOs.ComentarioTarea;
using ConsultCore31.Application.Interfaces;

namespace ConsultCore31.WebAPI.Controllers.V1
{
    /// <summary>
    /// Controlador para gestionar los comentarios de tareas
    /// </summary>
    [ApiVersion("1.0")]
    public class ComentariosTareaController : GenericController<ComentarioTareaDto, CreateComentarioTareaDto, UpdateComentarioTareaDto, int>
    {
        private readonly IComentarioTareaService _comentarioTareaService;

        /// <summary>
        /// Constructor
        /// </summary>
        public ComentariosTareaController(
            IComentarioTareaService comentarioTareaService,
            ILogger<ComentariosTareaController> logger)
            : base(comentarioTareaService, logger, "comentario de tarea")
        {
            _comentarioTareaService = comentarioTareaService;
        }

        /// <summary>
        /// Obtiene el ID de la entidad desde el DTO
        /// </summary>
        protected override int GetIdFromDto(ComentarioTareaDto dto)
        {
            return dto.Id;
        }

        /// <summary>
        /// Verifica si el ID de la ruta coincide con el ID del DTO
        /// </summary>
        protected override bool IsIdMatchingDto(int id, UpdateComentarioTareaDto updateDto)
        {
            return id == updateDto.Id;
        }
    }
}