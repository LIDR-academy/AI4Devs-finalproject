using ConsultCore31.Application.DTOs.TipoMovimientoViatico;
using ConsultCore31.Application.Interfaces;
using ConsultCore31.WebAPI.Controllers.V1;

using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

using Moq;

namespace ConsultCore31.Tests.Controllers
{
    /// <summary>
    /// Pruebas para el controlador de tipos de movimiento de viático
    /// </summary>
    public class TiposMovimientoViaticoControllerTests
    {
        private readonly Mock<ITipoMovimientoViaticoService> _mockService;
        private readonly Mock<ILogger<TiposMovimientoViaticoController>> _mockLogger;
        private readonly TiposMovimientoViaticoController _controller;

        public TiposMovimientoViaticoControllerTests()
        {
            _mockService = new Mock<ITipoMovimientoViaticoService>();
            _mockLogger = new Mock<ILogger<TiposMovimientoViaticoController>>();
            _controller = new TiposMovimientoViaticoController(_mockService.Object, _mockLogger.Object);
        }

        [Fact]
        public async Task GetAll_DebeRetornarOkConListaDeTipos()
        {
            // Arrange
            var tipos = new List<TipoMovimientoViaticoDto>
            {
                new TipoMovimientoViaticoDto { Id = 1, Nombre = "Anticipo", Descripcion = "Anticipo de viáticos", Afectacion = 1, FechaCreacion = DateTime.UtcNow },
                new TipoMovimientoViaticoDto { Id = 2, Nombre = "Gasto", Descripcion = "Gasto de viáticos", Afectacion = -1, FechaCreacion = DateTime.UtcNow }
            };

            _mockService.Setup(service => service.GetAllAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(tipos);

            // Act
            var result = await _controller.GetAll();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsAssignableFrom<IEnumerable<TipoMovimientoViaticoDto>>(okResult.Value);
            Assert.Equal(2, ((List<TipoMovimientoViaticoDto>)returnValue).Count);
        }

        [Fact]
        public async Task GetById_ConIdExistente_DebeRetornarOkConTipo()
        {
            // Arrange
            var tipo = new TipoMovimientoViaticoDto
            {
                Id = 1,
                Nombre = "Anticipo",
                Descripcion = "Anticipo de viáticos",
                Afectacion = 1,
                FechaCreacion = DateTime.UtcNow
            };

            _mockService.Setup(service => service.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(tipo);

            // Act
            var result = await _controller.GetById(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsType<TipoMovimientoViaticoDto>(okResult.Value);
            Assert.Equal(1, returnValue.Id);
            Assert.Equal("Anticipo", returnValue.Nombre);
        }

        [Fact]
        public async Task GetById_ConIdInexistente_DebeRetornarNotFound()
        {
            // Arrange
            _mockService.Setup(service => service.GetByIdAsync(999, It.IsAny<CancellationToken>()))
                .ReturnsAsync((TipoMovimientoViaticoDto)null);

            // Act
            var result = await _controller.GetById(999);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task Create_ConDatosValidos_DebeRetornarCreatedAtAction()
        {
            // Arrange
            var createDto = new CreateTipoMovimientoViaticoDto
            {
                Nombre = "Reembolso",
                Descripcion = "Reembolso de viáticos",
                Afectacion = 1,
                Activo = true
            };

            var createdDto = new TipoMovimientoViaticoDto
            {
                Id = 3,
                Nombre = "Reembolso",
                Descripcion = "Reembolso de viáticos",
                Afectacion = 1,
                Activo = true,
                FechaCreacion = DateTime.UtcNow
            };

            _mockService.Setup(service => service.CreateAsync(createDto, It.IsAny<CancellationToken>()))
                .ReturnsAsync(createdDto);

            // Act
            var result = await _controller.Create(createDto);

            // Assert
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result);
            Assert.Equal(nameof(TiposMovimientoViaticoController.GetById), createdAtActionResult.ActionName);
            Assert.Equal(3, createdAtActionResult.RouteValues["id"]);
            var returnValue = Assert.IsType<TipoMovimientoViaticoDto>(createdAtActionResult.Value);
            Assert.Equal(3, returnValue.Id);
            Assert.Equal("Reembolso", returnValue.Nombre);
        }

        [Fact]
        public async Task Update_ConIdYDtoValidos_DebeRetornarNoContent()
        {
            // Arrange
            var updateDto = new UpdateTipoMovimientoViaticoDto
            {
                Id = 1,
                Nombre = "Anticipo Actualizado",
                Descripcion = "Descripción actualizada",
                Afectacion = -1,
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
            var updateDto = new UpdateTipoMovimientoViaticoDto
            {
                Id = 2,
                Nombre = "Anticipo Actualizado",
                Descripcion = "Descripción actualizada",
                Afectacion = -1,
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
            var updateDto = new UpdateTipoMovimientoViaticoDto
            {
                Id = 999,
                Nombre = "Tipo Inexistente",
                Descripcion = "Descripción inexistente",
                Afectacion = 1,
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