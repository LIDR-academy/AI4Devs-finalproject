using ConsultCore31.Application.DTOs.EstadoProyecto;
using ConsultCore31.Application.Interfaces;
using ConsultCore31.WebAPI.Controllers.V1;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;

namespace ConsultCore31.Tests.Controllers
{
    public class EstadosProyectoControllerTests
    {
        private readonly Mock<IEstadoProyectoService> _mockService;
        private readonly Mock<ILogger<EstadosProyectoController>> _mockLogger;
        private readonly EstadosProyectoController _controller;

        public EstadosProyectoControllerTests()
        {
            _mockService = new Mock<IEstadoProyectoService>();
            _mockLogger = new Mock<ILogger<EstadosProyectoController>>();
            _controller = new EstadosProyectoController(_mockService.Object, _mockLogger.Object);
        }

        [Fact]
        public async Task GetAll_DebeRetornarOkConListaDeEstadosProyecto()
        {
            // Arrange
            var estadosProyecto = new List<EstadoProyectoDto>
            {
                new EstadoProyectoDto { Id = 1, Nombre = "Iniciado", Descripcion = "Proyecto recién iniciado", Color = "#00FF00", Orden = 1, EsEstadoFinal = false, Activo = true },
                new EstadoProyectoDto { Id = 2, Nombre = "En Progreso", Descripcion = "Proyecto en desarrollo", Color = "#FFFF00", Orden = 2, EsEstadoFinal = false, Activo = true },
                new EstadoProyectoDto { Id = 3, Nombre = "Finalizado", Descripcion = "Proyecto completado", Color = "#0000FF", Orden = 3, EsEstadoFinal = true, Activo = true }
            };

            _mockService.Setup(service => service.GetAllAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(estadosProyecto);

            // Act
            var result = await _controller.GetAll();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsAssignableFrom<IEnumerable<EstadoProyectoDto>>(okResult.Value);
            Assert.Equal(3, returnValue.Count());
            
            _mockService.Verify(service => service.GetAllAsync(It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task GetById_ConIdExistente_DebeRetornarOkConEstadoProyecto()
        {
            // Arrange
            int estadoProyectoId = 1;
            var estadoProyecto = new EstadoProyectoDto
            {
                Id = estadoProyectoId,
                Nombre = "Iniciado",
                Descripcion = "Proyecto recién iniciado",
                Color = "#00FF00",
                Orden = 1,
                EsEstadoFinal = false,
                Activo = true
            };

            _mockService.Setup(service => service.GetByIdAsync(estadoProyectoId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(estadoProyecto);

            // Act
            var result = await _controller.GetById(estadoProyectoId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsType<EstadoProyectoDto>(okResult.Value);
            Assert.Equal(estadoProyectoId, returnValue.Id);
            Assert.Equal("Iniciado", returnValue.Nombre);
            
            _mockService.Verify(service => service.GetByIdAsync(estadoProyectoId, It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task GetById_ConIdInexistente_DebeRetornarNotFound()
        {
            // Arrange
            int estadoProyectoId = 999;

            _mockService.Setup(service => service.GetByIdAsync(estadoProyectoId, It.IsAny<CancellationToken>()))
                .ReturnsAsync((EstadoProyectoDto)null);

            // Act
            var result = await _controller.GetById(estadoProyectoId);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
            
            _mockService.Verify(service => service.GetByIdAsync(estadoProyectoId, It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task Create_ConDatosValidos_DebeRetornarCreatedAtAction()
        {
            // Arrange
            var createDto = new CreateEstadoProyectoDto
            {
                Nombre = "Nuevo Estado",
                Descripcion = "Descripción del nuevo estado",
                Color = "#FF0000",
                Orden = 4,
                EsEstadoFinal = false,
                Activo = true
            };

            var estadoProyectoCreado = new EstadoProyectoDto
            {
                Id = 4,
                Nombre = "Nuevo Estado",
                Descripcion = "Descripción del nuevo estado",
                Color = "#FF0000",
                Orden = 4,
                EsEstadoFinal = false,
                Activo = true
            };

            _mockService.Setup(service => service.CreateAsync(createDto, It.IsAny<CancellationToken>()))
                .ReturnsAsync(estadoProyectoCreado);

            // Act
            var result = await _controller.Create(createDto);

            // Assert
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result);
            Assert.Equal(nameof(EstadosProyectoController.GetById), createdAtActionResult.ActionName);
            Assert.Equal(4, createdAtActionResult.RouteValues["id"]);
            var returnValue = Assert.IsType<EstadoProyectoDto>(createdAtActionResult.Value);
            Assert.Equal("Nuevo Estado", returnValue.Nombre);
            
            _mockService.Verify(service => service.CreateAsync(createDto, It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task Update_ConIdExistenteYDatosValidos_DebeRetornarOkConMensaje()
        {
            // Arrange
            int estadoProyectoId = 1;
            var updateDto = new UpdateEstadoProyectoDto
            {
                Id = estadoProyectoId,
                Nombre = "Estado Actualizado",
                Descripcion = "Descripción actualizada",
                Color = "#FFAA00",
                Orden = 5,
                EsEstadoFinal = true,
                Activo = true
            };

            _mockService.Setup(service => service.UpdateAsync(updateDto, It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.Update(estadoProyectoId, updateDto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsAssignableFrom<object>(okResult.Value);
            Assert.Contains("estado de proyecto actualizado", returnValue.ToString().ToLower());
            
            _mockService.Verify(service => service.UpdateAsync(updateDto, It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task Update_ConIdNoCoincidente_DebeRetornarBadRequest()
        {
            // Arrange
            int estadoProyectoId = 1;
            var updateDto = new UpdateEstadoProyectoDto
            {
                Id = 2, // ID diferente al de la ruta
                Nombre = "Estado Actualizado",
                Descripcion = "Descripción actualizada",
                Color = "#FFAA00",
                Orden = 5,
                EsEstadoFinal = true,
                Activo = true
            };

            // Act
            var result = await _controller.Update(estadoProyectoId, updateDto);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
            
            _mockService.Verify(service => service.UpdateAsync(It.IsAny<UpdateEstadoProyectoDto>(), It.IsAny<CancellationToken>()), Times.Never);
        }

        [Fact]
        public async Task Update_ConIdInexistente_DebeRetornarNotFound()
        {
            // Arrange
            int estadoProyectoId = 999;
            var updateDto = new UpdateEstadoProyectoDto
            {
                Id = estadoProyectoId,
                Nombre = "Estado Inexistente",
                Descripcion = "Descripción de estado inexistente",
                Color = "#FFFFFF",
                Orden = 10,
                EsEstadoFinal = false,
                Activo = true
            };

            _mockService.Setup(service => service.UpdateAsync(updateDto, It.IsAny<CancellationToken>()))
                .ThrowsAsync(new KeyNotFoundException($"No se encontró el estado de proyecto con ID {estadoProyectoId}"));

            // Act
            var result = await _controller.Update(estadoProyectoId, updateDto);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
            
            _mockService.Verify(service => service.UpdateAsync(updateDto, It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task Delete_ConIdExistente_DebeRetornarOkConMensaje()
        {
            // Arrange
            int estadoProyectoId = 1;

            _mockService.Setup(service => service.DeleteAsync(estadoProyectoId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.Delete(estadoProyectoId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsAssignableFrom<object>(okResult.Value);
            Assert.Contains("estado de proyecto eliminado", returnValue.ToString().ToLower());
            
            _mockService.Verify(service => service.DeleteAsync(estadoProyectoId, It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task Delete_ConIdInexistente_DebeRetornarNotFound()
        {
            // Arrange
            int estadoProyectoId = 999;

            _mockService.Setup(service => service.DeleteAsync(estadoProyectoId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);

            // Act
            var result = await _controller.Delete(estadoProyectoId);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
            
            _mockService.Verify(service => service.DeleteAsync(estadoProyectoId, It.IsAny<CancellationToken>()), Times.Once);
        }
    }
}
