using ConsultCore31.WebAPI.Controllers;
using ConsultCore31.WebAPI.Controllers.V1;
using ConsultCore31.WebAPI.DTOs.Auth;
using ConsultCore31.WebAPI.Services.Interfaces;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Primitives;

using Moq;

using System.Security.Claims;

namespace ConsultCore31.Tests.Controllers
{
    /// <summary>
    /// Pruebas para el controlador de autenticación
    /// </summary>
    public class AuthControllerTests
    {
        private readonly Mock<IAuthService> _mockAuthService;
        private readonly Mock<ILogger<AuthController>> _mockLogger;
        private readonly AuthController _controller;

        public AuthControllerTests()
        {
            _mockAuthService = new Mock<IAuthService>();
            _mockLogger = new Mock<ILogger<AuthController>>();
            _controller = new AuthController(_mockAuthService.Object, _mockLogger.Object);

            // Configurar HttpContext para simular la dirección IP
            var httpContext = new DefaultHttpContext();
            httpContext.Connection.RemoteIpAddress = System.Net.IPAddress.Parse("127.0.0.1");
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = httpContext
            };
        }

        [Fact]
        public async Task Login_ConCredencialesValidas_DebeRetornarOkConAuthResponse()
        {
            // Arrange
            var loginRequest = new LoginRequestDto
            {
                UsernameOrEmail = "usuario@ejemplo.com",
                Password = "Password123!",
                RememberMe = true
            };

            var authResponse = new AuthResponseDto
            {
                Token = "jwt-token-example",
                RefreshToken = "refresh-token-example",
                Expiration = DateTime.UtcNow.AddHours(1),
                UserId = "user-id",
                Email = "usuario@ejemplo.com",
                FullName = "Usuario Ejemplo",
                Roles = new List<string> { "User" },
                Permissions = new List<string> { "Read" }
            };

            _mockAuthService.Setup(service => service.LoginAsync(loginRequest, "127.0.0.1"))
                .ReturnsAsync(authResponse);

            // Act
            var result = await _controller.Login(loginRequest);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsType<AuthResponseDto>(okResult.Value);
            Assert.Equal("jwt-token-example", returnValue.Token);
            Assert.Equal("usuario@ejemplo.com", returnValue.Email);
        }

        [Fact]
        public async Task Login_ConCredencialesInvalidas_DebeRetornarUnauthorized()
        {
            // Arrange
            var loginRequest = new LoginRequestDto
            {
                UsernameOrEmail = "usuario@ejemplo.com",
                Password = "ContraseñaIncorrecta",
                RememberMe = false
            };

            _mockAuthService.Setup(service => service.LoginAsync(loginRequest, "127.0.0.1"))
                .ReturnsAsync((AuthResponseDto)null);

            // Act
            var result = await _controller.Login(loginRequest);

            // Assert
            var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(result);
            Assert.Equal("Credenciales inválidas", unauthorizedResult.Value);
        }

        [Fact]
        public async Task RefreshToken_ConTokenValido_DebeRetornarOkConAuthResponse()
        {
            // Arrange
            var refreshRequest = new RefreshTokenRequestDto
            {
                RefreshToken = "valid-refresh-token"
            };

            var authResponse = new AuthResponseDto
            {
                Token = "new-jwt-token",
                RefreshToken = "new-refresh-token",
                Expiration = DateTime.UtcNow.AddHours(1),
                UserId = "user-id",
                Email = "usuario@ejemplo.com",
                FullName = "Usuario Ejemplo",
                Roles = new List<string> { "User" },
                Permissions = new List<string> { "Read" }
            };

            _mockAuthService.Setup(service => service.RefreshTokenAsync(refreshRequest, "127.0.0.1"))
                .ReturnsAsync(authResponse);

            // Act
            var result = await _controller.RefreshToken(refreshRequest);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsType<AuthResponseDto>(okResult.Value);
            Assert.Equal("new-jwt-token", returnValue.Token);
        }

        [Fact]
        public async Task RefreshToken_ConTokenInvalido_DebeRetornarUnauthorized()
        {
            // Arrange
            var refreshRequest = new RefreshTokenRequestDto
            {
                RefreshToken = "invalid-refresh-token"
            };

            _mockAuthService.Setup(service => service.RefreshTokenAsync(refreshRequest, "127.0.0.1"))
                .ReturnsAsync((AuthResponseDto)null);

            // Act
            var result = await _controller.RefreshToken(refreshRequest);

            // Assert
            var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(result);
            Assert.Equal("Token inválido o expirado", unauthorizedResult.Value);
        }

        [Fact]
        public async Task RevokeToken_ConTokenValido_DebeRetornarOk()
        {
            // Arrange
            var token = "valid-refresh-token";

            _mockAuthService.Setup(service => service.RevokeTokenAsync(token, "127.0.0.1"))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.RevokeToken(token);

            // Assert
            Assert.IsType<OkResult>(result);
        }

        [Fact]
        public async Task RevokeToken_ConTokenInvalido_DebeRetornarBadRequest()
        {
            // Arrange
            var token = "invalid-refresh-token";

            _mockAuthService.Setup(service => service.RevokeTokenAsync(token, "127.0.0.1"))
                .ReturnsAsync(false);

            // Act
            var result = await _controller.RevokeToken(token);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Token inválido", badRequestResult.Value);
        }

        [Fact]
        public async Task RevokeToken_ConTokenVacio_DebeRetornarBadRequest()
        {
            // Arrange
            string token = null;

            // Act
            var result = await _controller.RevokeToken(token);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Token es requerido", badRequestResult.Value);
        }

        [Fact]
        public async Task Register_ConDatosValidos_DebeRetornarOk()
        {
            // Arrange
            var registerRequest = new RegisterRequestDto
            {
                Email = "nuevo@ejemplo.com",
                UserName = "nuevoUsuario",
                Password = "Password123!",
                ConfirmPassword = "Password123!",
                FirstName = "Nuevo",
                LastName = "Usuario"
            };

            _mockAuthService.Setup(service => service.RegisterAsync(registerRequest, It.IsAny<string>()))
                .ReturnsAsync(true);

            // Configurar el encabezado Origin
            var httpContext = new DefaultHttpContext();
            httpContext.Request.Headers["Origin"] = "https://ejemplo.com";
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = httpContext
            };

            // Act
            var result = await _controller.Register(registerRequest);

            // Assert
            Assert.IsType<OkResult>(result);
        }

        [Fact]
        public async Task Register_ConDatosInvalidos_DebeRetornarBadRequest()
        {
            // Arrange
            var registerRequest = new RegisterRequestDto
            {
                Email = "email-invalido",
                UserName = "",
                Password = "weak",
                ConfirmPassword = "different",
                FirstName = "",
                LastName = ""
            };

            _mockAuthService.Setup(service => service.RegisterAsync(registerRequest, It.IsAny<string>()))
                .ReturnsAsync(false);

            // Act
            var result = await _controller.Register(registerRequest);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("No se pudo registrar el usuario", badRequestResult.Value);
        }

        [Fact]
        public async Task ConfirmEmail_ConDatosValidos_DebeRetornarOk()
        {
            // Arrange
            var userId = "user-id";
            var token = "confirmation-token";

            _mockAuthService.Setup(service => service.ConfirmEmailAsync(userId, token))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.ConfirmEmail(userId, token);

            // Assert
            Assert.IsType<OkResult>(result);
        }

        [Fact]
        public async Task ConfirmEmail_ConDatosInvalidos_DebeRetornarBadRequest()
        {
            // Arrange
            var userId = "invalid-user-id";
            var token = "invalid-token";

            _mockAuthService.Setup(service => service.ConfirmEmailAsync(userId, token))
                .ReturnsAsync(false);

            // Act
            var result = await _controller.ConfirmEmail(userId, token);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("No se pudo confirmar el email", badRequestResult.Value);
        }

        [Fact]
        public async Task ConfirmEmail_ConParametrosFaltantes_DebeRetornarBadRequest()
        {
            // Act
            var result = await _controller.ConfirmEmail(null, "token");

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("UserId y Token son requeridos", badRequestResult.Value);
        }

        [Fact]
        public async Task ForgotPassword_ConEmailValido_DebeRetornarOk()
        {
            // Arrange
            var email = "usuario@ejemplo.com";

            _mockAuthService.Setup(service => service.ForgotPasswordAsync(email, It.IsAny<string>()))
                .ReturnsAsync(true);

            // Configurar el encabezado Origin
            var httpContext = new DefaultHttpContext();
            httpContext.Request.Headers["Origin"] = "https://ejemplo.com";
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = httpContext
            };

            // Act
            var result = await _controller.ForgotPassword(email);

            // Assert
            Assert.IsType<OkResult>(result);
        }

        [Fact]
        public async Task ForgotPassword_ConEmailInexistente_DebeRetornarOk()
        {
            // Arrange - Incluso con un email inexistente, debemos devolver OK por seguridad
            var email = "noexiste@ejemplo.com";

            _mockAuthService.Setup(service => service.ForgotPasswordAsync(email, It.IsAny<string>()))
                .ReturnsAsync(false);

            // Act
            var result = await _controller.ForgotPassword(email);

            // Assert - Siempre debe retornar OK por seguridad
            Assert.IsType<OkResult>(result);
        }

        [Fact]
        public async Task ForgotPassword_ConEmailVacio_DebeRetornarBadRequest()
        {
            // Arrange
            string email = null;

            // Act
            var result = await _controller.ForgotPassword(email);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Email es requerido", badRequestResult.Value);
        }

        [Fact]
        public async Task ResetPassword_ConDatosValidos_DebeRetornarOk()
        {
            // Arrange
            var resetRequest = new ResetPasswordRequestDto
            {
                Email = "usuario@ejemplo.com",
                Token = "reset-token",
                Password = "NewPassword123!",
                ConfirmPassword = "NewPassword123!"
            };

            _mockAuthService.Setup(service => service.ResetPasswordAsync(resetRequest))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.ResetPassword(resetRequest);

            // Assert
            Assert.IsType<OkResult>(result);
        }

        [Fact]
        public async Task ResetPassword_ConDatosInvalidos_DebeRetornarBadRequest()
        {
            // Arrange
            var resetRequest = new ResetPasswordRequestDto
            {
                Email = "usuario@ejemplo.com",
                Token = "invalid-token",
                Password = "NewPassword123!",
                ConfirmPassword = "NewPassword123!"
            };

            _mockAuthService.Setup(service => service.ResetPasswordAsync(resetRequest))
                .ReturnsAsync(false);

            // Act
            var result = await _controller.ResetPassword(resetRequest);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("No se pudo restablecer la contraseña", badRequestResult.Value);
        }

        [Fact]
        public async Task GetCurrentUser_ConUsuarioAutenticado_DebeRetornarOkConUserDto()
        {
            // Arrange
            var userId = "user-123";
            var userDto = new UserDto
            {
                UserId = userId,
                FullName = "Usuario Ejemplo",
                Email = "usuario@ejemplo.com",
                Roles = new List<string> { "User" },
                Permissions = new List<string> { "Read" }
            };

            // Configurar el usuario autenticado con claims
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, userId),
                new Claim(ClaimTypes.Name, "usuario"),
                new Claim(ClaimTypes.Email, "usuario@ejemplo.com")
            };
            var identity = new ClaimsIdentity(claims, "TestAuthType");
            var claimsPrincipal = new ClaimsPrincipal(identity);

            // Configurar el HttpContext con el usuario autenticado
            var httpContext = new DefaultHttpContext
            {
                User = claimsPrincipal
            };

            var controller = new AuthController(_mockAuthService.Object, _mockLogger.Object);
            controller.ControllerContext = new ControllerContext
            {
                HttpContext = httpContext
            };

            _mockAuthService.Setup(service => service.GetUserByIdAsync(userId))
                .ReturnsAsync(userDto);

            // Act
            var result = await controller.GetCurrentUser();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var apiResponse = okResult.Value as ApiResponse<UserDto>;
            Assert.NotNull(apiResponse);
            Assert.Equal(200, apiResponse.StatusCode);
            Assert.Equal(userId, apiResponse.Data.UserId);
            Assert.Equal("usuario@ejemplo.com", apiResponse.Data.Email);
        }

        [Fact]
        public async Task GetCurrentUser_ConUsuarioNoAutenticado_DebeRetornarUnauthorized()
        {
            // Arrange
            // Configurar un HttpContext sin usuario autenticado
            var httpContext = new DefaultHttpContext();

            var controller = new AuthController(_mockAuthService.Object, _mockLogger.Object);
            controller.ControllerContext = new ControllerContext
            {
                HttpContext = httpContext
            };

            // Act
            var result = await controller.GetCurrentUser();

            // Assert
            var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(result);
            var apiResponse = unauthorizedResult.Value as ApiResponse;
            Assert.NotNull(apiResponse);
            Assert.Equal(401, apiResponse.StatusCode);
            Assert.Equal("Usuario no autenticado", apiResponse.Message);
        }

        [Fact]
        public async Task GetCurrentUser_ConUsuarioNoEncontrado_DebeRetornarUnauthorized()
        {
            // Arrange
            var userId = "user-not-found";

            // Configurar el usuario autenticado con claims
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, userId)
            };
            var identity = new ClaimsIdentity(claims, "TestAuthType");
            var claimsPrincipal = new ClaimsPrincipal(identity);

            // Configurar el HttpContext con el usuario autenticado
            var httpContext = new DefaultHttpContext
            {
                User = claimsPrincipal
            };

            var controller = new AuthController(_mockAuthService.Object, _mockLogger.Object);
            controller.ControllerContext = new ControllerContext
            {
                HttpContext = httpContext
            };

            _mockAuthService.Setup(service => service.GetUserByIdAsync(userId))
                .ReturnsAsync((UserDto)null);

            // Act
            var result = await controller.GetCurrentUser();

            // Assert
            var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(result);
            var apiResponse = unauthorizedResult.Value as ApiResponse;
            Assert.NotNull(apiResponse);
            Assert.Equal(401, apiResponse.StatusCode);
            Assert.Equal("Usuario no encontrado", apiResponse.Message);
        }

        [Fact]
        public async Task Logout_ConTokenValido_DebeRetornarOk()
        {
            // Arrange
            var refreshToken = "valid-refresh-token";
            var jwtToken = "valid-jwt-token";

            // Configurar el servicio de autenticación
            _mockAuthService.Setup(service => service.RevokeTokenAsync(refreshToken, "127.0.0.1"))
                .ReturnsAsync(true);

            // Crear un DefaultHttpContext que podemos manipular directamente
            var httpContext = new DefaultHttpContext();
            
            // Configurar el encabezado de autorización
            httpContext.Request.Headers["Authorization"] = $"Bearer {jwtToken}";
            
            // Configurar la dirección IP remota
            httpContext.Connection.RemoteIpAddress = System.Net.IPAddress.Parse("127.0.0.1");
            
            // Configurar los mocks para Request.Cookies y Response.Cookies
            var cookiesMock = new Mock<IRequestCookieCollection>();
            cookiesMock.Setup(c => c["refreshToken"]).Returns(refreshToken);
            cookiesMock.Setup(c => c.ContainsKey("refreshToken")).Returns(true);
            
            var requestMock = new Mock<HttpRequest>();
            requestMock.Setup(r => r.Cookies).Returns(cookiesMock.Object);
            requestMock.Setup(r => r.Headers).Returns(httpContext.Request.Headers);
            
            var responseCookiesMock = new Mock<IResponseCookies>();
            var responseMock = new Mock<HttpResponse>();
            responseMock.Setup(r => r.Cookies).Returns(responseCookiesMock.Object);
            
            var contextMock = new Mock<HttpContext>();
            contextMock.Setup(c => c.Request).Returns(requestMock.Object);
            contextMock.Setup(c => c.Response).Returns(responseMock.Object);
            contextMock.Setup(c => c.Connection.RemoteIpAddress).Returns(httpContext.Connection.RemoteIpAddress);
            
            // Configurar el controlador con nuestro contexto HTTP
            var controller = new AuthController(_mockAuthService.Object, _mockLogger.Object);
            controller.ControllerContext = new ControllerContext
            {
                HttpContext = contextMock.Object
            };
            
            // Act
            var result = await controller.Logout();
            
            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            dynamic apiResponse = okResult.Value;
            Assert.Equal(200, apiResponse.StatusCode);
            Assert.Equal("Sesión cerrada correctamente", apiResponse.Message);
            
            // Verificar que se llamó al método para revocar el token
            _mockAuthService.Verify(service => service.RevokeTokenAsync(refreshToken, "127.0.0.1"), Times.Once);
            
            // Verificar que se eliminó la cookie
            responseCookiesMock.Verify(c => c.Delete("refreshToken"), Times.Once);
        }

        [Fact]
        public async Task Logout_SinTokenDeAutorizacion_DebeRetornarBadRequest()
        {
            // Arrange
            // Configurar el HttpContext sin token de autorización
            var httpContext = new DefaultHttpContext();
            httpContext.Connection.RemoteIpAddress = System.Net.IPAddress.Parse("127.0.0.1");

            var controller = new AuthController(_mockAuthService.Object, _mockLogger.Object);
            controller.ControllerContext = new ControllerContext
            {
                HttpContext = httpContext
            };

            // Act
            var result = await controller.Logout();

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var apiResponse = badRequestResult.Value as ApiResponse;
            Assert.NotNull(apiResponse);
            Assert.Equal(400, apiResponse.StatusCode);
            Assert.Equal("Token no proporcionado", apiResponse.Message);
        }
    }
}