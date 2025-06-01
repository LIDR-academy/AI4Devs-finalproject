// En Core/Specifications/AccesosActivosByPerfilIdSpec.cs
using Ardalis.Specification;
using ConsultCore31.Core.Entities;

namespace ConsultCore31.Core.Specifications
{
    /// <summary>
    /// Especificación para obtener los accesos activos de un perfil específico
    /// </summary>
    public class AccesosActivosByPerfilIdSpec : Specification<Acceso>
    {
        /// <summary>
        /// Inicializa una nueva instancia de la clase <see cref="AccesosActivosByPerfilIdSpec"/>
        /// </summary>
        /// <param name="perfilId">ID del perfil</param>
        public AccesosActivosByPerfilIdSpec(int perfilId)
        {
            Query.Where(a => a.PerfilId == perfilId && a.Activo);
            
            // Incluir la información del objeto relacionado
            Query.Include(a => a.Objeto);
        }
    }
}
