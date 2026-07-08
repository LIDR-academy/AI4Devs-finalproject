using Aura.Core.Models;

namespace Aura.Core.Interfaces.Repositories;

public interface IEventRepository : IRepository<Event>
{
    Task<Event?> GetBySlugAsync(string slug);
    Task<bool> ExistsBySlugAsync(string slug);
}
