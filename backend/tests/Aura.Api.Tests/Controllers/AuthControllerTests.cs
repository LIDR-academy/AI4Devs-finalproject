using Aura.Api.Controllers;
using Aura.Core.DTOs.Auth;
using Aura.Core.Interfaces.Repositories;
using Aura.Core.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;
using NSubstitute;
using Xunit;

namespace Aura.Api.Tests.Controllers;

public class AuthControllerTests
{
    [Fact]
    public async Task RequestMagicLink_ShouldReturnOk()
    {
        var authService = Substitute.For<IAuthService>();
        var userRepo = Substitute.For<IUserRepository>();
        var userConsentRepo = Substitute.For<IUserConsentRepository>();
        var configuration = Substitute.For<Microsoft.Extensions.Configuration.IConfiguration>();

        var sut = new AuthController(authService, userRepo, userConsentRepo, configuration);

        var httpContext = new Microsoft.AspNetCore.Http.DefaultHttpContext();
        httpContext.Request.Scheme = "http";
        httpContext.Request.Host = new Microsoft.AspNetCore.Http.HostString("localhost");
        sut.ControllerContext = new ControllerContext { HttpContext = httpContext };

        var result = await sut.RequestMagicLink(new MagicLinkRequest { Email = "test@example.com" });

        Assert.IsType<OkObjectResult>(result);
    }
}
