using ConsultCore31.Application.DTOs.Empleado;
using ConsultCore31.Application.Interfaces;
using ConsultCore31.WebAPI.Controllers.V1;

using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

using Moq;

namespace ConsultCore31.Tests.Controllers
{
    /// <summary>
    /// Pruebas de integración para el controlador de empleados
    /// </summary>
    public class EmpleadosControllerTests
    {
        private readonly Mock<IEmpleadoService> _mockService;
        private readonly Mock<ILogger<EmpleadosController>> _mockLogger;
        private readonly EmpleadosController _controller;

        public EmpleadosControllerTests()
        {
            _mockService = new Mock<IEmpleadoService>();
            _mockLogger = new Mock<ILogger<EmpleadosController>>();
            _controller = new EmpleadosController(_mockService.Object, _mockLogger.Object);
        }

        [Fact]
        public async Task GetAll_DebeRetornarOk_ConListaDeEmpleados()
        {
            // Arrange
            var empleados = new List<EmpleadoDto>
            {
                new EmpleadoDto
                {
                    Id = 1,
                    Nombre = "Juan",
                    Apellidos = "Pérez",
                    Email = "juan.perez@example.com",
                    Telefono = "1234567890",
                    Movil = "0987654321",
                    FechaCreacion = DateTime.UtcNow
                },
                new EmpleadoDto
                {
                    Id = 2,
                    Nombre = "María",
                    Apellidos = "González",
                    Email = "maria.gonzalez@example.com",
                    Telefono = "1234567891",
                    Movil = "0987654322",
                    FechaCreacion = DateTime.UtcNow
                }
            };

            _mockService.Setup(service => service.GetAllAsync(It.IsAny<System.Threading.CancellationToken>()))
                .ReturnsAsync(empleados);

            // Act
            var result = await _controller.GetAll();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedEmpleados = Assert.IsAssignableFrom<IEnumerable<EmpleadoDto>>(okResult.Value);
            Assert.Equal(2, ((List<EmpleadoDto>)returnedEmpleados).Count);
        }

        [Fact]
        public async Task GetById_ConIdExistente_DebeRetornarOk_ConEmpleado()
        {
            // Arrange
            var empleado = new EmpleadoDto
            {
                Id = 1,
                Nombre = "Juan",
                Apellidos = "Pérez",
                Email = "juan.perez@example.com",
                Telefono = "1234567890",
                Movil = "0987654321",
                FechaCreacion = DateTime.UtcNow
            };

            _mockService.Setup(service => service.GetByIdAsync(1, It.IsAny<System.Threading.CancellationToken>()))
                .ReturnsAsync(empleado);

            // Act
            var result = await _controller.GetById(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedEmpleado = Assert.IsType<EmpleadoDto>(okResult.Value);
            Assert.Equal(1, returnedEmpleado.Id);
            Assert.Equal("Juan", returnedEmpleado.Nombre);
            Assert.Equal("Pérez", returnedEmpleado.Apellidos);
        }

        [Fact]
        public async Task GetById_ConIdInexistente_DebeRetornarNotFound()
        {
            // Arrange
            _mockService.Setup(service => service.GetByIdAsync(999, It.IsAny<System.Threading.CancellationToken>()))
                .ReturnsAsync((EmpleadoDto)null);

            // Act
            var result = await _controller.GetById(999);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task Create_ConDatosValidos_DebeRetornarCreated_ConEmpleado()
        {
            // Arrange
            var createDto = new CreateEmpleadoDto
            {
                Nombre = "Nuevo",
                Apellidos = "Empleado",
                Email = "nuevo.empleado@example.com",
                Telefono = "1234567890",
                Movil = "0987654321",
                Activo = true,
                Genero = 1
            };

            var createdEmpleado = new EmpleadoDto
            {
                Id = 1,
                Nombre = "Nuevo",
                Apellidos = "Empleado",
                Email = "nuevo.empleado@example.com",
                Telefono = "1234567890",
                Movil = "0987654321",
                Activo = true,
                Genero = 1,
                FechaCreacion = DateTime.UtcNow
            };

            _mockService.Setup(service => service.CreateAsync(createDto, It.IsAny<System.Threading.CancellationToken>()))
                .ReturnsAsync(createdEmpleado);

            // Act
            var result = await _controller.Create(createDto);

            // Assert
            var createdResult = Assert.IsType<CreatedAtActionResult>(result);
            Assert.Equal(nameof(EmpleadosController.GetById), createdResult.ActionName);
            Assert.Equal(1, createdResult.RouteValues["id"]);
            var returnedEmpleado = Assert.IsType<EmpleadoDto>(createdResult.Value);
            Assert.Equal(1, returnedEmpleado.Id);
            Assert.Equal("Nuevo", returnedEmpleado.Nombre);
            Assert.Equal("Empleado", returnedEmpleado.Apellidos);
        }

        [Fact]
        public async Task Update_ConIdExistenteYDatosValidos_DebeRetornarNoContent()
        {
            // Arrange
            var updateDto = new UpdateEmpleadoDto
            {
                Id = 1,
                Nombre = "Empleado",
                Apellidos = "Actualizado",
                Email = "empleado.actualizado@example.com",
                Telefono = "9876543210",
                Movil = "0123456789",
                Activo = true,
                Genero = 2
            };

            _mockService.Setup(service => service.UpdateAsync(updateDto, It.IsAny<System.Threading.CancellationToken>()))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.Update(1, updateDto);

            // Assert
            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task Update_ConIdNoCoincidente_DebeRetornarBadRequest()
        {
            // Arrange
            var updateDto = new UpdateEmpleadoDto
            {
                Id = 2,
                Nombre = "Empleado",
                Apellidos = "Actualizado",
                Email = "empleado.actualizado@example.com",
                Telefono = "9876543210",
                Movil = "0123456789",
                Activo = true,
                Genero = 2
            };

            // Act
            var result = await _controller.Update(1, updateDto);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task Update_ConIdInexistente_DebeRetornarNotFound()
        {
            // Arrange
            var updateDto = new UpdateEmpleadoDto
            {
                Id = 999,
                Nombre = "Empleado",
                Apellidos = "Actualizado",
                Email = "empleado.actualizado@example.com",
                Telefono = "9876543210",
                Movil = "0123456789",
                Activo = true,
                Genero = 2
            };

            _mockService.Setup(service => service.UpdateAsync(updateDto, It.IsAny<System.Threading.CancellationToken>()))
                .ReturnsAsync(false);

            // Act
            var result = await _controller.Update(999, updateDto);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task Delete_ConIdExistente_DebeRetornarNoContent()
        {
            // Arrange
            _mockService.Setup(service => service.DeleteAsync(1, It.IsAny<System.Threading.CancellationToken>()))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.Delete(1);

            // Assert
            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task Delete_ConIdInexistente_DebeRetornarNotFound()
        {
            // Arrange
            _mockService.Setup(service => service.DeleteAsync(999, It.IsAny<System.Threading.CancellationToken>()))
                .ReturnsAsync(false);

            // Act
            var result = await _controller.Delete(999);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }
    }
}