namespace ConsultCore31.Core.Common
{
    /// <summary>
    /// Clase base para eventos de dominio
    /// </summary>
    public abstract class BaseDomainEvent
    {
        /// <summary>
        /// Fecha en que ocurrió el evento
        /// </summary>
        public DateTime DateOccurred { get; protected set; } = DateTime.UtcNow;

        /// <summary>
        /// Identificador único del evento
        /// </summary>
        public Guid EventId { get; private set; } = Guid.NewGuid();
    }
}