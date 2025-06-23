namespace ConsultCore31.Application.Interfaces
{
    /// <summary>
    /// Interfaz genérica para servicios CRUD
    /// </summary>
    /// <typeparam name="TDto">Tipo del DTO de respuesta</typeparam>
    /// <typeparam name="TCreateDto">Tipo del DTO para crear</typeparam>
    /// <typeparam name="TUpdateDto">Tipo del DTO para actualizar</typeparam>
    /// <typeparam name="TKey">Tipo de la clave primaria</typeparam>
    public interface IGenericService<TDto, TCreateDto, TUpdateDto, TKey> where TKey : IEquatable<TKey>
    {
        /// <summary>
        /// Obtiene todas las entidades activas
        /// </summary>
        Task<IEnumerable<TDto>> GetAllAsync(CancellationToken cancellationToken = default);

        /// <summary>
        /// Obtiene una entidad por su ID
        /// </summary>
        Task<TDto> GetByIdAsync(TKey id, CancellationToken cancellationToken = default);

        /// <summary>
        /// Crea una nueva entidad
        /// </summary>
        Task<TDto> CreateAsync(TCreateDto createDto, CancellationToken cancellationToken = default);

        /// <summary>
        /// Actualiza una entidad existente
        /// </summary>
        Task<bool> UpdateAsync(TUpdateDto updateDto, CancellationToken cancellationToken = default);

        /// <summary>
        /// Elimina una entidad por su ID (borrado lógico)
        /// </summary>
        Task<bool> DeleteAsync(TKey id, CancellationToken cancellationToken = default);

        /// <summary>
        /// Verifica si existe una entidad con el ID especificado
        /// </summary>
        Task<bool> ExistsAsync(TKey id, CancellationToken cancellationToken = default);
    }
}