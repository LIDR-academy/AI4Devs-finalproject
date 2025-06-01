using System;
using System.ComponentModel.DataAnnotations;

namespace ConsultCore31.Application.DTOs.ComentarioTarea
{
    /// <summary>
    /// DTO para crear un nuevo comentario de tarea
    /// </summary>
    public class CreateComentarioTareaDto
    {
        /// <summary>
        /// Identificador de la tarea a la que pertenece el comentario
        /// </summary>
        [Required(ErrorMessage = "El identificador de la tarea es obligatorio")]
        public int TareaId { get; set; }

        /// <summary>
        /// Identificador del usuario que realiza el comentario
        /// </summary>
        [Required(ErrorMessage = "El identificador del usuario es obligatorio")]
        public int UsuarioId { get; set; }

        /// <summary>
        /// Contenido del comentario
        /// </summary>
        [Required(ErrorMessage = "El contenido del comentario es obligatorio")]
        public string Contenido { get; set; } = string.Empty;

        /// <summary>
        /// Indica si el comentario tiene archivos adjuntos
        /// </summary>
        public bool TieneArchivosAdjuntos { get; set; } = false;

        /// <summary>
        /// Indica si el comentario está activo
        /// </summary>
        public bool Activo { get; set; } = true;
    }
}
