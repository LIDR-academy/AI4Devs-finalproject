using Aura.Core.Interfaces.Repositories;
using Aura.Core.Models;
using Aura.Infrastructure.Data;

namespace Aura.Infrastructure.Repositories;

public class GuestRepository : Repository<Guest>, IGuestRepository
{
    public GuestRepository(ApplicationDbContext context) : base(context)
    {
    }
}
