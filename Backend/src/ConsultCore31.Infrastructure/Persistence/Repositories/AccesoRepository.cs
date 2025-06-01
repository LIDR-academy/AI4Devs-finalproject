// En Infrastructure/Persistence/Repositories/AccesoRepository.cs
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Ardalis.Specification;
using ConsultCore31.Core.Entities;
using ConsultCore31.Core.Interfaces;
using ConsultCore31.Core.Specifications;
using ConsultCore31.Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace ConsultCore31.Infrastructure.Persistence.Repositories
{
    public class AccesoRepository : RepositoryBase<Acceso>, IAccesoRepository
    {
        private readonly AppDbContext _context;

        public AccesoRepository(AppDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Acceso>> GetAccesosActivosByPerfilIdAsync(int perfilId)
        {
            return await _context.Accesos
                .Include(a => a.Objeto)
                .Where(a => a.PerfilId == perfilId && a.Activo)
                .ToListAsync();
        }

        public async Task<IEnumerable<Acceso>> GetAccesosByObjetoIdAsync(int objetoId)
        {
            return await _context.Accesos
                .Include(a => a.Perfil)
                .Where(a => a.ObjetoId == objetoId)
                .ToListAsync();
        }

        public async Task<bool> UpdateAccesoStatusAsync(int perfilId, int objetoId, bool activo)
        {
            var spec = new AccesoByIdsSpec(perfilId, objetoId);
            var acceso = await FirstOrDefaultAsync(spec);
                
            if (acceso == null)
                return false;
                
            acceso.Activo = activo;
            await UpdateAsync(acceso);
            return true;
        }
    }
}