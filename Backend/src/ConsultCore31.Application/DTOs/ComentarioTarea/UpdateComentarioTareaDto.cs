using System;
using System.ComponentModel.DataAnnotations;

namespace ConsultCore31.Application.DTOs.ComentarioTarea
{
    /// <summary>
    /// DTO para actualizar un comentario de tarea existente
    /// </summary>
    public class UpdateComentarioTareaDto
    {
        /// <summary>
        /// Identificador único del comentario
        /// </summary>
        [Required(ErrorMessage = "El identificador del comentario es obligatorio")]
        public int Id { get; set; }

        /// <summary>
        /// Contenido del comentario
        /// </summary>
        [Required(ErrorMessage = "El contenido del comentario es obligatorio")]
        public string Contenido { get; set; } = string.Empty;

        /// <summary>
        /// Indica si el comentario tiene archivos adjuntos
        /// </summary>
        public bool TieneArchivosAdjuntos { get; set; }

        /// <summary>
        /// Indica si el comentario está activo
        /// </summary>
        public bool Activo { get; set; } = true;
    }
}
