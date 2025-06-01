using System;

namespace ConsultCore31.Core.Common
{
    /// <summary>
    /// Interfaz para entidades con un identificador de tipo T
    /// </summary>
    /// <typeparam name="T">Tipo del identificador</typeparam>
    public interface IEntity<T> where T : IEquatable<T>
    {
        /// <summary>
        /// Identificador único de la entidad
        /// </summary>
        T Id { get; set; }
    }
}
