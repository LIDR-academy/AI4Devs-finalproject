using System.ComponentModel.DataAnnotations;

namespace ConsultCore31.Application.DTOs.Common
{
    /// <summary>
    /// DTO base para actualización de entidades con tipo de clave genérico
    /// </summary>
    /// <typeparam name="TKey">Tipo de la clave primaria</typeparam>
    public abstract class UpdateBaseDto<TKey>
    {
        /// <summary>
        /// Identificador único de la entidad a actualizar
        /// </summary>
        [Required(ErrorMessage = "El ID es requerido")]
        public TKey Id { get; set; } = default!;
    }

    /// <summary>
    /// DTO base para actualización de entidades con clave Guid (para compatibilidad con código existente)
    /// </summary>
    public abstract class UpdateBaseDto : UpdateBaseDto<Guid>
    {
        // Hereda todas las propiedades de UpdateBaseDto<Guid>
    }
}