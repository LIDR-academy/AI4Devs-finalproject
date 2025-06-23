using ConsultCore31.Application.DTOs.Cliente;
using ConsultCore31.Application.Interfaces;
using ConsultCore31.WebAPI.Controllers.V1;

using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

using Moq;

namespace ConsultCore31.Tests.Controllers
{
    /// <summary>
    /// Pruebas para el controlador de clientes
    /// </summary>
    public class ClientesControllerTests
    {
        private readonly Mock<IClienteService> _mockService;
        private readonly Mock<ILogger<ClientesController>> _mockLogger;
        private readonly ClientesController _controller;

        public ClientesControllerTests()
        {
            _mockService = new Mock<IClienteService>();
            _mockLogger = new Mock<ILogger<ClientesController>>();
            _controller = new ClientesController(_mockService.Object, _mockLogger.Object);
        }

        [Fact]
        public async Task GetAll_DebeRetornarOkConListaDeClientes()
        {
            // Arrange
            var clientes = new List<ClienteDto>
            {
                new ClienteDto { Id = 1, Nombre = "Cliente 1", Email = "cliente1@example.com", FechaCreacion = DateTime.UtcNow },
                new ClienteDto { Id = 2, Nombre = "Cliente 2", Email = "cliente2@example.com", FechaCreacion = DateTime.UtcNow }
            };

            _mockService.Setup(service => service.GetAllAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(clientes);

            // Act
            var result = await _controller.GetAll();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsAssignableFrom<IEnumerable<ClienteDto>>(okResult.Value);
            Assert.Equal(2, ((List<ClienteDto>)returnValue).Count);
        }

        [Fact]
        public async Task GetById_ConIdExistente_DebeRetornarOkConCliente()
        {
            // Arrange
            var cliente = new ClienteDto
            {
                Id = 1,
                Nombre = "Cliente Test",
                Email = "cliente@example.com",
                FechaCreacion = DateTime.UtcNow
            };

            _mockService.Setup(service => service.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(cliente);

            // Act
            var result = await _controller.GetById(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsType<ClienteDto>(okResult.Value);
            Assert.Equal(1, returnValue.Id);
            Assert.Equal("Cliente Test", returnValue.Nombre);
        }

        [Fact]
        public async Task GetById_ConIdInexistente_DebeRetornarNotFound()
        {
            // Arrange
            _mockService.Setup(service => service.GetByIdAsync(999, It.IsAny<CancellationToken>()))
                .ReturnsAsync((ClienteDto)null);

            // Act
            var result = await _controller.GetById(999);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task Create_ConDatosValidos_DebeRetornarCreatedAtAction()
        {
            // Arrange
            var createDto = new CreateClienteDto
            {
                Nombre = "Nuevo Cliente",
                Email = "nuevo@example.com",
                Telefono = "1234567890",
                Activo = true
            };

            var createdDto = new ClienteDto
            {
                Id = 1,
                Nombre = "Nuevo Cliente",
                Email = "nuevo@example.com",
                Telefono = "1234567890",
                Activo = true,
                FechaCreacion = DateTime.UtcNow
            };

            _mockService.Setup(service => service.CreateAsync(createDto, It.IsAny<CancellationToken>()))
                .ReturnsAsync(createdDto);

            // Act
            var result = await _controller.Create(createDto);

            // Assert
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result);
            Assert.Equal(nameof(ClientesController.GetById), createdAtActionResult.ActionName);
            Assert.Equal(1, createdAtActionResult.RouteValues["id"]);
            var returnValue = Assert.IsType<ClienteDto>(createdAtActionResult.Value);
            Assert.Equal(1, returnValue.Id);
            Assert.Equal("Nuevo Cliente", returnValue.Nombre);
        }

        [Fact]
        public async Task Update_ConIdYDtoValidos_DebeRetornarNoContent()
        {
            // Arrange
            var updateDto = new UpdateClienteDto
            {
                Id = 1,
                Nombre = "Cliente Actualizado",
                Email = "actualizado@example.com",
                Telefono = "9876543210",
                Activo = true
            };

            _mockService.Setup(service => service.UpdateAsync(updateDto, It.IsAny<CancellationToken>()))
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
            var updateDto = new UpdateClienteDto
            {
                Id = 2,
                Nombre = "Cliente Actualizado",
                Email = "actualizado@example.com",
                Telefono = "9876543210",
                Activo = true
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
            var updateDto = new UpdateClienteDto
            {
                Id = 999,
                Nombre = "Cliente Actualizado",
                Email = "actualizado@example.com",
                Telefono = "9876543210",
                Activo = true
            };

            _mockService.Setup(service => service.UpdateAsync(updateDto, It.IsAny<CancellationToken>()))
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
            _mockService.Setup(service => service.DeleteAsync(1, It.IsAny<CancellationToken>()))
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
            _mockService.Setup(service => service.DeleteAsync(999, It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);

            // Act
            var result = await _controller.Delete(999);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }
    }
}