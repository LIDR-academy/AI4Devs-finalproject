using Aura.Core.Interfaces.Repositories;
using Aura.Core.Models;
using Aura.Infrastructure.Data;

namespace Aura.Infrastructure.Repositories;

public class AccompliceRepository : Repository<Accomplice>, IAccompliceRepository
{
    public AccompliceRepository(ApplicationDbContext context) : base(context)
    {
    }
}
