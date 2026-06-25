using AwesomeAssertions;

namespace Aura.Core.Tests;

public class UnitTest1
{
    [Fact]
    public void Test1()
    {
        var isWorking = true;
        isWorking.Should().BeTrue();
    }
}
