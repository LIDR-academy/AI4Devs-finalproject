using System.Threading;
using System.Threading.Tasks;
using Aura.Infrastructure.Queue;
using NSubstitute;
using StackExchange.Redis;
using Xunit;

namespace Aura.Infrastructure.Tests.Queue;

public class DragonflyQueueServiceTests
{
    private readonly IConnectionMultiplexer _connectionMultiplexer;
    private readonly IDatabase _database;
    private readonly DragonflyQueueService _queueService;

    public DragonflyQueueServiceTests()
    {
        _connectionMultiplexer = Substitute.For<IConnectionMultiplexer>();
        _database = Substitute.For<IDatabase>();
        _connectionMultiplexer.GetDatabase(-1, null).ReturnsForAnyArgs(_database);

        _queueService = new DragonflyQueueService(_connectionMultiplexer);
    }

    [Fact]
    public async Task EnqueueAsync_ShouldPushToLeftOfList()
    {
        // Arrange
        var queueName = "test:queue";
        var message = "test-message";

        // Act
        await _queueService.EnqueueAsync(queueName, message);

        // Assert
        await _database.Received(1).ListLeftPushAsync(queueName, (RedisValue)message, When.Always, CommandFlags.None);
    }

    [Fact]
    public async Task DequeueAsync_ShouldPopFromRightOfList_WhenMessageExists()
    {
        // Arrange
        var queueName = "test:queue";
        var message = "test-message";
        _database.ListRightPopAsync(queueName, CommandFlags.None).Returns(Task.FromResult((RedisValue)message));

        // Act
        var result = await _queueService.DequeueAsync(queueName);

        // Assert
        Assert.Equal(message, result);
        await _database.Received(1).ListRightPopAsync(queueName, CommandFlags.None);
    }
}
