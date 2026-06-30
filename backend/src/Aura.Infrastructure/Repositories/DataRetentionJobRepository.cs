using Aura.Core.Interfaces.Repositories;
using Aura.Core.Models;
using Aura.Infrastructure.Data;

namespace Aura.Infrastructure.Repositories;

public class DataRetentionJobRepository : Repository<DataRetentionJob>, IDataRetentionJobRepository
{
    public DataRetentionJobRepository(ApplicationDbContext context) : base(context)
    {
    }
}
