using System.Security.Claims;
using Aura.Api.Controllers;
using Aura.Core.DTOs.Events;
using Aura.Core.Interfaces.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using NSubstitute;
using Xunit;

namespace Aura.Api.Tests.Controllers;

public class EventsControllerTests
{
    [Fact]
    public async Task UploadHeroImage_ShouldReturnBadRequest_WhenFileIsNull()
    {
        // Arrange
        var eventService = Substitute.For<IEventService>();
        var objectStorageService = Substitute.For<IObjectStorageService>();
        var sut = new EventsController(eventService);

        // Act
        var result = await sut.UploadHeroImage("slug", null, objectStorageService);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal("No file uploaded.", badRequestResult.Value);
    }

    [Fact]
    public async Task UploadHeroImage_ShouldReturnBadRequest_WhenFileIsTooLarge()
    {
        // Arrange
        var eventService = Substitute.For<IEventService>();
        var objectStorageService = Substitute.For<IObjectStorageService>();
        var sut = new EventsController(eventService);

        var file = Substitute.For<IFormFile>();
        file.Length.Returns((5 * 1024 * 1024) + 1); // 5MB + 1 byte

        // Act
        var result = await sut.UploadHeroImage("slug", file, objectStorageService);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal("Image must be under 5MB", badRequestResult.Value);
    }

    [Fact]
    public async Task UploadHeroImage_ShouldReturnBadRequest_WhenFileExtensionIsInvalid()
    {
        // Arrange
        var eventService = Substitute.For<IEventService>();
        var objectStorageService = Substitute.For<IObjectStorageService>();
        var sut = new EventsController(eventService);

        var file = Substitute.For<IFormFile>();
        file.Length.Returns(1024);
        file.FileName.Returns("image.gif");

        // Act
        var result = await sut.UploadHeroImage("slug", file, objectStorageService);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal("Only JPG and PNG files are allowed.", badRequestResult.Value);
    }

    [Fact]
    public async Task UploadHeroImage_ShouldReturnNotFound_WhenUserDoesNotOwnEvent()
    {
        // Arrange
        var eventService = Substitute.For<IEventService>();
        var objectStorageService = Substitute.For<IObjectStorageService>();
        var sut = new EventsController(eventService);

        var file = Substitute.For<IFormFile>();
        file.Length.Returns(1024);
        file.FileName.Returns("image.jpg");
        file.ContentType.Returns("image/jpeg");

        var userId = Guid.NewGuid();
        var httpContext = new DefaultHttpContext();
        httpContext.User = new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim(ClaimTypes.NameIdentifier, userId.ToString()) }));
        sut.ControllerContext = new ControllerContext { HttpContext = httpContext };

        eventService.GetEventBySlugAsync("test-event", userId).Returns(Task.FromResult<EventResponse?>(null));

        // Act
        var result = await sut.UploadHeroImage("test-event", file, objectStorageService);

        // Assert
        Assert.IsType<NotFoundResult>(result);
    }

    [Fact]
    public async Task UploadHeroImage_ShouldReturnOkWithUrl_WhenUploadIsSuccessful()
    {
        // Arrange
        var eventService = Substitute.For<IEventService>();
        var objectStorageService = Substitute.For<IObjectStorageService>();
        var sut = new EventsController(eventService);

        var file = Substitute.For<IFormFile>();
        file.Length.Returns(1024);
        file.FileName.Returns("image.jpg");
        file.ContentType.Returns("image/jpeg");

        var userId = Guid.NewGuid();
        var httpContext = new DefaultHttpContext();
        httpContext.User = new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim(ClaimTypes.NameIdentifier, userId.ToString()) }));
        sut.ControllerContext = new ControllerContext { HttpContext = httpContext };

        eventService.GetEventBySlugAsync("test-event", userId).Returns(new EventResponse { Slug = "test-event" });
        objectStorageService.UploadFileAsync("uploads", Arg.Any<string>(), Arg.Any<Stream>(), "image/jpeg")
            .Returns(Task.FromResult("/uploads/events/test-event/hero.jpg"));

        // Act
        var result = await sut.UploadHeroImage("test-event", file, objectStorageService);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var value = okResult.Value;
        Assert.NotNull(value);
        var urlProperty = value.GetType().GetProperty("url");
        Assert.NotNull(urlProperty);
        Assert.Equal("/uploads/events/test-event/hero.jpg", urlProperty.GetValue(value));
    }
}
