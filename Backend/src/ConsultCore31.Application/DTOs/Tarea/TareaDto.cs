namespace ConsultCore31.Application.DTOs.Tarea
{
    /// <summary>
    /// DTO para representar una tarea en operaciones de lectura
    /// </summary>
    public class TareaDto
    {
        /// <summary>
        /// Identificador único de la tarea
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Título de la tarea
        /// </summary>
        public string Titulo { get; set; } = string.Empty;

        /// <summary>
        /// Descripción de la tarea
        /// </summary>
        public string? Descripcion { get; set; }

        /// <summary>
        /// Identificador del proyecto al que pertenece la tarea
        /// </summary>
        public int ProyectoId { get; set; }

        /// <summary>
        /// Nombre del proyecto al que pertenece la tarea
        /// </summary>
        public string? ProyectoNombre { get; set; }

        /// <summary>
        /// Identificador de la etapa a la que pertenece la tarea
        /// </summary>
        public int? EtapaProyectoId { get; set; }

        /// <summary>
        /// Nombre de la etapa a la que pertenece la tarea
        /// </summary>
        public string? EtapaProyectoNombre { get; set; }

        /// <summary>
        /// Identificador del estado de la tarea
        /// </summary>
        public int EstadoTareaId { get; set; }

        /// <summary>
        /// Nombre del estado de la tarea
        /// </summary>
        public string? EstadoTareaNombre { get; set; }

        /// <summary>
        /// Identificador de la prioridad de la tarea
        /// </summary>
        public int PrioridadTareaId { get; set; }

        /// <summary>
        /// Nombre de la prioridad de la tarea
        /// </summary>
        public string? PrioridadTareaNombre { get; set; }

        /// <summary>
        /// Fecha de vencimiento de la tarea
        /// </summary>
        public DateTime? FechaVencimiento { get; set; }

        /// <summary>
        /// Fecha de completitud de la tarea
        /// </summary>
        public DateTime? FechaCompletada { get; set; }

        /// <summary>
        /// Porcentaje de completitud de la tarea
        /// </summary>
        public decimal? PorcentajeCompletado { get; set; }

        /// <summary>
        /// Identificador del usuario que creó la tarea
        /// </summary>
        public int CreadoPorId { get; set; }

        /// <summary>
        /// Nombre del usuario que creó la tarea
        /// </summary>
        public string? CreadoPorNombre { get; set; }

        /// <summary>
        /// Identificador del usuario asignado a la tarea
        /// </summary>
        public int? AsignadoAId { get; set; }

        /// <summary>
        /// Nombre del usuario asignado a la tarea
        /// </summary>
        public string? AsignadoANombre { get; set; }

        /// <summary>
        /// Indica si la tarea es un recordatorio
        /// </summary>
        public bool EsRecordatorio { get; set; }

        /// <summary>
        /// Fecha del recordatorio
        /// </summary>
        public DateTime? FechaRecordatorio { get; set; }

        /// <summary>
        /// Indica si la tarea es privada
        /// </summary>
        public bool EsPrivada { get; set; }

        /// <summary>
        /// Indica si la tarea tiene archivos adjuntos
        /// </summary>
        public bool TieneArchivosAdjuntos { get; set; }

        /// <summary>
        /// Indica si la tarea está activa
        /// </summary>
        public bool Activa { get; set; }

        /// <summary>
        /// Fecha de creación de la tarea
        /// </summary>
        public DateTime FechaCreacion { get; set; }

        /// <summary>
        /// Fecha de última modificación de la tarea
        /// </summary>
        public DateTime? FechaModificacion { get; set; }
    }
}