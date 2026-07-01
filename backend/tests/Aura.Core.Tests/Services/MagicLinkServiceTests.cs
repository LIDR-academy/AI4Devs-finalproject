using Aura.Core.Services;
using Xunit;

namespace Aura.Core.Tests.Services;

public class MagicLinkServiceTests
{
    private readonly MagicLinkService _sut;

    public MagicLinkServiceTests()
    {
        _sut = new MagicLinkService();
    }

    [Fact]
    public void GenerateToken_ShouldReturnNonEmptyString()
    {
        var token = _sut.GenerateToken();
        Assert.False(string.IsNullOrWhiteSpace(token));
    }

    [Fact]
    public void HashToken_ShouldReturnConsistentHash()
    {
        var token = "my-secret-token";
        var hash1 = _sut.HashToken(token);
        var hash2 = _sut.HashToken(token);

        Assert.Equal(hash1, hash2);
    }

    [Fact]
    public void VerifyToken_WithValidToken_ShouldReturnTrue()
    {
        var token = _sut.GenerateToken();
        var hashedToken = _sut.HashToken(token);

        var isValid = _sut.VerifyToken(token, hashedToken);

        Assert.True(isValid);
    }

    [Fact]
    public void VerifyToken_WithInvalidToken_ShouldReturnFalse()
    {
        var token = _sut.GenerateToken();
        var invalidToken = _sut.GenerateToken();
        var hashedToken = _sut.HashToken(token);

        var isValid = _sut.VerifyToken(invalidToken, hashedToken);

        Assert.False(isValid);
    }
}
