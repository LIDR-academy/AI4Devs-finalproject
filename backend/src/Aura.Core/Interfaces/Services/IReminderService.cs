using System.Threading;
using System.Threading.Tasks;

namespace Aura.Core.Interfaces.Services;

public interface IReminderService
{
    Task ProcessAutomatedRemindersAsync(CancellationToken cancellationToken = default);
    Task SendManualRemindersAsync(string eventSlug, IEnumerable<Guid> guestIds, CancellationToken cancellationToken = default);
}
