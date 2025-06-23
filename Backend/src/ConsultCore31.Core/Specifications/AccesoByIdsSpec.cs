// En Core/Specifications/AccesoByIdsSpec.cs
using Ardalis.Specification;

using ConsultCore31.Core.Entities;

namespace ConsultCore31.Core.Specifications
{
    public class AccesoByIdsSpec : Specification<Acceso>
    {
        public AccesoByIdsSpec(int perfilId, int objetoId)
        {
            Query.Where(a => a.PerfilId == perfilId && a.ObjetoId == objetoId);
        }
    }
}