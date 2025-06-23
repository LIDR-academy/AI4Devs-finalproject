namespace ConsultCore31.Core.Interfaces
{
    /// <summary>
    /// Interfaz que define una entidad que tiene una fecha de modificación.
    /// </summary>
    public interface IHasModificationTime
    {
        /// <summary>
        /// Fecha de la última modificación de la entidad.
        /// </summary>
        DateTime? FechaModificacion { get; set; }
    }
}