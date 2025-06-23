using ConsultCore31.Core.Interfaces;

using System.ComponentModel.DataAnnotations.Schema;

namespace ConsultCore31.Core.Common
{
    /// <summary>
    /// Clase base para entidades con soporte para eventos de dominio
    /// </summary>
    /// <typeparam name="TKey">Tipo de la clave primaria</typeparam>
    public abstract class BaseEntity<TKey> : IEntity<TKey>, IHasModificationTime where TKey : IEquatable<TKey>
    {
        private readonly List<BaseDomainEvent> _domainEvents = new List<BaseDomainEvent>();

        /// <summary>
        /// Colección de eventos de dominio pendientes de procesar
        /// </summary>
        [NotMapped]
        public IReadOnlyCollection<BaseDomainEvent> DomainEvents => _domainEvents.AsReadOnly();

        /// <summary>
        /// Fecha de creación de la entidad.
        /// </summary>
        [Column("fechaCreacion")]
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Fecha de la última modificación de la entidad.
        /// </summary>
        [Column("fechaModificacion")]
        public DateTime? FechaModificacion { get; set; }

        /// <summary>
        /// Identificador único de la entidad
        /// </summary>
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public virtual TKey Id { get; set; }

        /// <summary>
        /// Agrega un evento de dominio a la colección
        /// </summary>
        /// <param name="eventItem">Evento a agregar</param>
        public void AddDomainEvent(BaseDomainEvent eventItem)
        {
            _domainEvents.Add(eventItem);
        }

        /// <summary>
        /// Limpia todos los eventos de dominio pendientes
        /// </summary>
        public void ClearDomainEvents()
        {
            _domainEvents.Clear();
        }

        /// <summary>
        /// Elimina un evento de dominio de la colección
        /// </summary>
        /// <param name="eventItem">Evento a eliminar</param>
        public void RemoveDomainEvent(BaseDomainEvent eventItem)
        {
            _domainEvents.Remove(eventItem);
        }
    }

    /// <summary>
    /// Clase base para entidades con identificador de tipo Guid
    /// </summary>
    public abstract class BaseEntity : BaseEntity<Guid>
    {
        // La funcionalidad está heredada de BaseEntity<Guid>
        // Se mantiene esta clase por compatibilidad con código existente
    }
}