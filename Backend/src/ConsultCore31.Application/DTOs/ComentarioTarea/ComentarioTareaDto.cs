using System;
using System.Text.Json.Serialization;

namespace ConsultCore31.Application.DTOs.ComentarioTarea
{
    /// <summary>
    /// DTO para representar un comentario de tarea en operaciones de lectura
    /// </summary>
    public class ComentarioTareaDto
    {
        /// <summary>
        /// Identificador único del comentario
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Identificador de la tarea a la que pertenece el comentario
        /// </summary>
        public int TareaId { get; set; }

        /// <summary>
        /// Título de la tarea a la que pertenece el comentario
        /// </summary>
        public string? TareaTitulo { get; set; }

        /// <summary>
        /// Identificador del usuario que realizó el comentario
        /// </summary>
        public int UsuarioId { get; set; }

        /// <summary>
        /// Nombre completo del usuario que realizó el comentario
        /// </summary>
        public string? UsuarioNombre { get; set; }

        /// <summary>
        /// Contenido del comentario
        /// </summary>
        public string Contenido { get; set; } = string.Empty;

        /// <summary>
        /// Fecha de creación del comentario
        /// </summary>
        public DateTime FechaCreacion { get; set; }

        /// <summary>
        /// Indica si el comentario tiene archivos adjuntos
        /// </summary>
        public bool TieneArchivosAdjuntos { get; set; }

        /// <summary>
        /// Indica si el comentario está activo
        /// </summary>
        public bool Activo { get; set; }

        /// <summary>
        /// Fecha de última modificación del comentario
        /// </summary>
        public DateTime? FechaModificacion { get; set; }
    }
}
