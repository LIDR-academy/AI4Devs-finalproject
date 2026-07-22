using Aura.Core.Interfaces.Repositories;
using Aura.Core.Models;
using Aura.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Aura.Core.Models;
using Aura.Infrastructure.Data;

namespace Aura.Infrastructure.Repositories;

public class InvitationRepository : Repository<Invitation>, IInvitationRepository
{
    public InvitationRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<Invitation?> GetByTokenHashAsync(string tokenHash, CancellationToken cancellationToken = default)
    {
        return await _context.Invitations
            .Include(i => i.Event)
            .Include(i => i.Guest)
            .Include(i => i.Rsvp)
            .FirstOrDefaultAsync(i => i.TokenHash == tokenHash && !i.IsDeleted, cancellationToken);
    }
}
