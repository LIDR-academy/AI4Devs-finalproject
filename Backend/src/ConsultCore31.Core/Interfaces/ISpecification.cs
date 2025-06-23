namespace ConsultCore31.Core.Interfaces
{
    /// <summary>
    /// Interfaz base para especificaciones que hereda de Ardalis.Specification.ISpecification
    /// </summary>
    /// <typeparam name="T">Tipo de entidad</typeparam>
    public interface ISpecification<T> : global::Ardalis.Specification.ISpecification<T> where T : class
    {
        // Propiedades adicionales específicas de la aplicación pueden ir aquí
    }
}