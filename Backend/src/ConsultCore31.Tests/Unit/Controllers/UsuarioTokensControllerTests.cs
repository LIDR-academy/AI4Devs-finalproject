using System;
using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using FluentAssertions;
using ConsultCore31.WebAPI.Controllers.V1;
using ConsultCore31.Application.Interfaces;
using System.Security.Claims;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.Extensions.Primitives;

namespace ConsultCore31.Tests.Unit.Controllers
{
    public class UsuarioTokensControllerTests
    {
        private readonly Mock<IUsuarioTokenService> _mockTokenService;
        private readonly Mock<ILogger<UsuarioTokensController>> _mockLogger;
        private readonly UsuarioTokensController _controller;

        public UsuarioTokensControllerTests()
        {
            _mockTokenService = new Mock<IUsuarioTokenService>();
            _mockLogger = new Mock<ILogger<UsuarioTokensController>>();
            _controller = new UsuarioTokensController(_mockTokenService.Object, _mockLogger.Object);
            
            // Configurar el contexto HTTP con una IP de ejemplo
            var httpContext = new DefaultHttpContext();
            httpContext.Connection.RemoteIpAddress = IPAddress.Parse("192.168.1.1");
            _controller.ControllerContext = new ControllerContext()
            {
                HttpContext = httpContext
            };
        }

        [Fact]
        public async Task InvalidateUserTokens_WithValidUserId_ReturnsOkResult()
        {
            // Arrange
            var usuarioId = "123";
            var motivo = "Cierre de sesión solicitado por el usuario";

            // Act
            var result = await _controller.InvalidateUserTokens(usuarioId, motivo);

            // Assert
            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            okResult.StatusCode.Should().Be(StatusCodes.Status200OK);
            
            var response = okResult.Value.Should().BeAssignableTo<object>().Subject;
            response.Should().NotBeNull();
            response.GetType().GetProperty("Success").GetValue(response).Should().Be(true);
            response.GetType().GetProperty("Message").GetValue(response).Should().NotBeNull();
            response.GetType().GetProperty("UsuarioId").GetValue(response).Should().Be(int.Parse(usuarioId));

            _mockTokenService.Verify(s => s.InvalidateUserTokensAsync(
                It.Is<int>(id => id == int.Parse(usuarioId)),
                It.IsAny<string>(),
                It.Is<string>(m => m == motivo)),
                Times.Once);
        }

        [Fact]
        public async Task InvalidateUserTokens_WithEmptyUserId_ReturnsBadRequest()
        {
            // Arrange
            var usuarioId = "";

            // Act
            var result = await _controller.InvalidateUserTokens(usuarioId);

            // Assert
            var badRequestResult = result.Should().BeOfType<BadRequestObjectResult>().Subject;
            badRequestResult.StatusCode.Should().Be(StatusCodes.Status400BadRequest);
            
            var problemDetails = badRequestResult.Value.Should().BeOfType<ProblemDetails>().Subject;
            problemDetails.Title.Should().Be("Solicitud inválida");
            problemDetails.Detail.Should().Be("El ID de usuario no puede estar vacío");

            _mockTokenService.Verify(s => s.InvalidateUserTokensAsync(
                It.IsAny<int>(),
                It.IsAny<string>(),
                It.IsAny<string>()),
                Times.Never);
        }

        [Fact]
        public async Task InvalidateUserTokens_WithInvalidUserId_ReturnsBadRequest()
        {
            // Arrange
            var usuarioId = "no_es_un_numero";

            // Act
            var result = await _controller.InvalidateUserTokens(usuarioId);

            // Assert
            var badRequestResult = result.Should().BeOfType<BadRequestObjectResult>().Subject;
            badRequestResult.StatusCode.Should().Be(StatusCodes.Status400BadRequest);
            
            var problemDetails = badRequestResult.Value.Should().BeOfType<ProblemDetails>().Subject;
            problemDetails.Title.Should().Be("Solicitud inválida");
            problemDetails.Detail.Should().Be("El ID de usuario debe ser un número entero positivo");

            _mockTokenService.Verify(s => s.InvalidateUserTokensAsync(
                It.IsAny<int>(),
                It.IsAny<string>(),
                It.IsAny<string>()),
                Times.Never);
        }

        [Fact]
        public async Task InvalidateUserTokens_WhenUserNotFound_ReturnsNotFound()
        {
            // Arrange
            var usuarioId = "999";
            var exception = new KeyNotFoundException("Usuario no encontrado");
            
            _mockTokenService.Setup(s => s.InvalidateUserTokensAsync(
                It.IsAny<int>(), 
                It.IsAny<string>(), 
                It.IsAny<string>()))
                .ThrowsAsync(exception);

            // Act
            var result = await _controller.InvalidateUserTokens(usuarioId);

            // Assert
            var notFoundResult = result.Should().BeOfType<NotFoundObjectResult>().Subject;
            notFoundResult.StatusCode.Should().Be(StatusCodes.Status404NotFound);
            
            var problemDetails = notFoundResult.Value.Should().BeOfType<ProblemDetails>().Subject;
            problemDetails.Title.Should().Be("Usuario no encontrado");
            problemDetails.Detail.Should().Be($"No se encontró un usuario con el ID: {usuarioId}");
        }

        [Fact]
        public async Task InvalidateUserTokens_WhenServiceThrowsException_ReturnsInternalServerError()
        {
            // Arrange
            var usuarioId = "123";
            var exception = new InvalidOperationException("Error en el servicio");
            
            _mockTokenService.Setup(s => s.InvalidateUserTokensAsync(
                It.IsAny<int>(), 
                It.IsAny<string>(), 
                It.IsAny<string>()))
                .ThrowsAsync(exception);

            // Act
            var result = await _controller.InvalidateUserTokens(usuarioId);

            // Assert
            var statusCodeResult = result.Should().BeOfType<ObjectResult>().Subject;
            statusCodeResult.StatusCode.Should().Be(StatusCodes.Status500InternalServerError);
            
            var problemDetails = statusCodeResult.Value.Should().BeOfType<ProblemDetails>().Subject;
            problemDetails.Title.Should().Be("Error interno del servidor");
            problemDetails.Status.Should().Be(StatusCodes.Status500InternalServerError);
        }

        [Fact]
        public async Task InvalidateUserTokens_WithNullMotivo_DoesNotIncludeMotivoInServiceCall()
        {
            // Arrange
            var usuarioId = "123";
            string motivo = null;

            // Act
            var result = await _controller.InvalidateUserTokens(usuarioId, motivo);

            // Assert
            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            okResult.StatusCode.Should().Be(StatusCodes.Status200OK);

            _mockTokenService.Verify(s => s.InvalidateUserTokensAsync(
                It.Is<int>(id => id == int.Parse(usuarioId)),
                It.IsAny<string>(),
                It.Is<string>(m => m == null)),
                Times.Once);
        }
    }
}
