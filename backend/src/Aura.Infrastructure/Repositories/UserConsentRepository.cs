using Aura.Core.Interfaces.Repositories;
using Aura.Core.Models;
using Aura.Infrastructure.Data;

namespace Aura.Infrastructure.Repositories;

public class UserConsentRepository : Repository<UserConsent>, IUserConsentRepository
{
    public UserConsentRepository(ApplicationDbContext context) : base(context)
    {
    }
}
