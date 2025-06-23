namespace ConsultCore31.Application.DTOs.Common
{
    /// <summary>
    /// DTO base para respuestas con tipo de clave genérico
    /// </summary>
    /// <typeparam name="TKey">Tipo de la clave primaria</typeparam>
    public abstract class BaseDto<TKey>
    {
        /// <summary>
        /// Identificador único
        /// </summary>
        public TKey Id { get; set; } = default!;

        /// <summary>
        /// Fecha de creación
        /// </summary>
        public DateTime FechaCreacion { get; set; }

        /// <summary>
        /// Fecha de última actualización
        /// </summary>
        public DateTime? FechaModificacion { get; set; }
    }

    /// <summary>
    /// DTO base para respuestas con clave Guid (para compatibilidad con código existente)
    /// </summary>
    public abstract class BaseDto : BaseDto<Guid>
    {
        // Hereda todas las propiedades de BaseDto<Guid>
    }
}