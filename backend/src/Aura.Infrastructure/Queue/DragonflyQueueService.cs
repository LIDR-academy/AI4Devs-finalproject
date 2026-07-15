using System;
using System.Threading;
using System.Threading.Tasks;
using Aura.Core.Interfaces.Services;
using StackExchange.Redis;

namespace Aura.Infrastructure.Queue;

public class DragonflyQueueService : IQueueService
{
    private readonly IConnectionMultiplexer _connectionMultiplexer;

    public DragonflyQueueService(IConnectionMultiplexer connectionMultiplexer)
    {
        _connectionMultiplexer = connectionMultiplexer;
    }

    public async Task EnqueueAsync(string queueName, string message, CancellationToken cancellationToken = default)
    {
        var db = _connectionMultiplexer.GetDatabase();
        await db.ListLeftPushAsync(queueName, message);
    }

    public async Task<string?> DequeueAsync(string queueName, CancellationToken cancellationToken = default)
    {
        var db = _connectionMultiplexer.GetDatabase();
        
        // Wait for up to 5 seconds to pop an item from the right side of the list
        var result = await db.ListRightPopAsync(queueName);
        
        if (result.HasValue)
        {
            return result.ToString();
        }

        // If the queue was empty, wait a bit so we don't hot loop if called in a loop
        // Alternatively, if we were using BRPOP natively, it would block on the server.
        // ListRightPopAsync does not block. In StackExchange.Redis, BRPOP is not fully natively exposed via a simple async method due to connection blocking.
        // However, we can use a small delay on the client side if the queue is empty.
        await Task.Delay(1000, cancellationToken);
        
        return null;
    }

    public async Task<long> GetQueueLengthAsync(string queueName, CancellationToken cancellationToken = default)
    {
        var db = _connectionMultiplexer.GetDatabase();
        return await db.ListLengthAsync(queueName);
    }
}
