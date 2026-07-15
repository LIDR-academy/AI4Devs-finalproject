using System.Threading;
using System.Threading.Tasks;

namespace Aura.Core.Interfaces.Services;

public interface IQueueService
{
    Task EnqueueAsync(string queueName, string message, CancellationToken cancellationToken = default);
    Task<string?> DequeueAsync(string queueName, CancellationToken cancellationToken = default);
    Task<long> GetQueueLengthAsync(string queueName, CancellationToken cancellationToken = default);
}
