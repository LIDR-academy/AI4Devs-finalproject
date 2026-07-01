using Aura.Core.Services;
using Aura.Core.Interfaces.Repositories;
using Aura.Core.Interfaces.Services;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Configuration;
using NSubstitute;
using Xunit;

namespace Aura.Core.Tests.Services;

public class AuthServiceTests
{
    [Fact]
    public async Task RequestMagicLinkAsync_ShouldSendEmail()
    {
        var userRepo = Substitute.For<IUserRepository>();
        var magicLinkService = Substitute.For<IMagicLinkService>();
        var emailService = Substitute.For<IEmailService>();
        var config = Substitute.For<IConfiguration>();
        var cache = Substitute.For<IDistributedCache>();

        magicLinkService.GenerateToken().Returns("token");

        var sut = new AuthService(userRepo, magicLinkService, emailService, config, cache);

        await sut.RequestMagicLinkAsync("test@example.com", "http://test.com/?token={token}");

        await emailService.Received(1).SendMagicLinkAsync("test@example.com", "http://test.com/?token=token");
    }
}
