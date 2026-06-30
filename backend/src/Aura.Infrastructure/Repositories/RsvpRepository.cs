using Aura.Core.Interfaces.Repositories;
using Aura.Core.Models;
using Aura.Infrastructure.Data;

namespace Aura.Infrastructure.Repositories;

public class RsvpRepository : Repository<Rsvp>, IRsvpRepository
{
    public RsvpRepository(ApplicationDbContext context) : base(context)
    {
    }
}
