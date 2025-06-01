// En Core/Interfaces/IAccesoRepository.cs
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Ardalis.Specification;
using ConsultCore31.Core.Entities;

namespace ConsultCore31.Core.Interfaces
{
    public interface IAccesoRepository : IRepository<Acceso>
    {
        Task<IEnumerable<Acceso>> GetAccesosActivosByPerfilIdAsync(int perfilId);
        Task<IEnumerable<Acceso>> GetAccesosByObjetoIdAsync(int objetoId);
        Task<bool> UpdateAccesoStatusAsync(int perfilId, int objetoId, bool activo);
    }
}