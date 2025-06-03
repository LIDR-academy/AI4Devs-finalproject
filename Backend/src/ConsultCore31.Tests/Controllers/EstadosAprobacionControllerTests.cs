using ConsultCore31.Application.DTOs.EstadoAprobacion;
using ConsultCore31.Application.Interfaces;
using ConsultCore31.WebAPI.Controllers.V1;

using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

using Moq;

namespace ConsultCore31.Tests.Controllers
{
    /// <summary>
    /// Pruebas para el controlador de estados de aprobación
    /// </summary>
    public class EstadosAprobacionControllerTests
    {
        private readonly EstadosAprobacionController _controller;
        private readonly Mock<ILogger<EstadosAprobacionController>> _mockLogger;
        private readonly Mock<IEstadoAprobacionService> _mockService;

        public EstadosAprobacionControllerTests()
        {
            _mockService = new Mock<IEstadoAprobacionService>();
            _mockLogger = new Mock<ILogger<EstadosAprobacionController>>();
            _controller = new EstadosAprobacionController(_mockService.Object, _mockLogger.Object);
        }

        [Fact]
        public async Task Create_ConDatosValidos_DebeRetornarCreatedAtAction()
        {
            // Arrange
            var createDto = new CreateEstadoAprobacionDto
            {
                Nombre = "Rechazado",
                Descripcion = "Solicitud rechazada",
                Activo = true
            };

            var createdDto = new EstadoAprobacionDto
            {
                Id = 3,
                Nombre = "Rechazado",
                Descripcion = "Solicitud rechazada",
                Activo = true,
                FechaCreacion = DateTime.UtcNow
            };

            _mockService.Setup(service => service.CreateAsync(createDto, It.IsAny<CancellationToken>()))
                .ReturnsAsync(createdDto);

            // Act
            var result = await _controller.Create(createDto).ConfigureAwait(false);

            // Assert
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result);
            Assert.Equal(nameof(EstadosAprobacionController.GetById), createdAtActionResult.ActionName);
            Assert.Equal(3, createdAtActionResult.RouteValues["id"]);
            var returnValue = Assert.IsType<EstadoAprobacionDto>(createdAtActionResult.Value);
            Assert.Equal(3, returnValue.Id);
            Assert.Equal("Rechazado", returnValue.Nombre);
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

        [Fact]
        public async Task GetAll_DebeRetornarOkConListaDeEstados()
        {
            // Arrange
            var estados = new List<EstadoAprobacionDto>
            {
                new EstadoAprobacionDto { Id = 1, Nombre = "Pendiente", Descripcion = "Pendiente de aprobación", FechaCreacion = DateTime.UtcNow },
                new EstadoAprobacionDto { Id = 2, Nombre = "Aprobado", Descripcion = "Aprobado", FechaCreacion = DateTime.UtcNow }
            };

            _mockService.Setup(service => service.GetAllAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(estados);

            // Act
            var result = await _controller.GetAll();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsAssignableFrom<IEnumerable<EstadoAprobacionDto>>(okResult.Value);
            Assert.Equal(2, ((List<EstadoAprobacionDto>)returnValue).Count);
        }

        [Fact]
        public async Task GetById_ConIdExistente_DebeRetornarOkConEstado()
        {
            // Arrange
            var estado = new EstadoAprobacionDto
            {
                Id = 1,
                Nombre = "Pendiente",
                Descripcion = "Pendiente de aprobación",
                FechaCreacion = DateTime.UtcNow
            };

            _mockService.Setup(service => service.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(estado);

            // Act
            var result = await _controller.GetById(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsType<EstadoAprobacionDto>(okResult.Value);
            Assert.Equal(1, returnValue.Id);
            Assert.Equal("Pendiente", returnValue.Nombre);
        }

        [Fact]
        public async Task GetById_ConIdInexistente_DebeRetornarNotFound()
        {
            // Arrange
            _mockService.Setup(service => service.GetByIdAsync(999, It.IsAny<CancellationToken>()))
                .ReturnsAsync((EstadoAprobacionDto)null);

            // Act
            var result = await _controller.GetById(999);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task Update_ConIdInexistente_DebeRetornarNotFound()
        {
            // Arrange
            var updateDto = new UpdateEstadoAprobacionDto
            {
                Id = 999,
                Nombre = "Estado Inexistente",
                Descripcion = "Descripción inexistente",
                Activo = true
            };

            _mockService.Setup(service => service.UpdateAsync(updateDto, It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);

            // Act
            var result = await _controller.Update(999, updateDto).ConfigureAwait(true);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task Update_ConIdNoCoincidente_DebeRetornarBadRequest()
        {
            // Arrange
            var updateDto = new UpdateEstadoAprobacionDto
            {
                Id = 2,
                Nombre = "Pendiente Actualizado",
                Descripcion = "Descripción actualizada",
                Activo = true
            };

            // Act
            var result = await _controller.Update(1, updateDto).ConfigureAwait(true);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task Update_ConIdYDtoValidos_DebeRetornarNoContent()
        {
            // Arrange
            var updateDto = new UpdateEstadoAprobacionDto
            {
                Id = 1,
                Nombre = "Pendiente Actualizado",
                Descripcion = "Descripción actualizada",
                Activo = true
            };

            _mockService.Setup(service => service.UpdateAsync(updateDto, It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.Update(1, updateDto).ConfigureAwait(true);

            // Assert
            Assert.IsType<NoContentResult>(result);
        }
    }
}