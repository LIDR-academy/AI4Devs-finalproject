using Aura.Core.Interfaces.Repositories;
using Aura.Core.Models;
using Aura.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Aura.Core.Models;
using Aura.Infrastructure.Data;

namespace Aura.Infrastructure.Repositories;

public class AccompliceRepository : Repository<Accomplice>, IAccompliceRepository
{
    private readonly new ApplicationDbContext _context;

    public AccompliceRepository(ApplicationDbContext context) : base(context)
    {
        _context = context;
    }

    public async Task<Accomplice?> GetByTokenAsync(string tokenHash, CancellationToken cancellationToken = default)
    {
        return await _context.Accomplices
            .FirstOrDefaultAsync(a => a.TokenHash == tokenHash, cancellationToken);
    }

    public async Task<IEnumerable<Accomplice>> GetAccomplicesByEventAsync(Guid eventId, CancellationToken cancellationToken = default)
    {
        return await _context.Accomplices
            .Where(a => a.EventId == eventId)
            .ToListAsync(cancellationToken);
    }
}
