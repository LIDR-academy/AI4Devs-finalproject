using ConsultCore31.Application.DTOs.ComentarioTarea;
using ConsultCore31.Application.Interfaces;
using ConsultCore31.WebAPI.Controllers.V1;

using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

using Moq;

namespace ConsultCore31.Tests.Controllers
{
    /// <summary>
    /// Pruebas de integración para el controlador de comentarios de tarea
    /// </summary>
    public class ComentariosTareaControllerTests
    {
        private readonly Mock<IComentarioTareaService> _mockService;
        private readonly Mock<ILogger<ComentariosTareaController>> _mockLogger;
        private readonly ComentariosTareaController _controller;

        public ComentariosTareaControllerTests()
        {
            _mockService = new Mock<IComentarioTareaService>();
            _mockLogger = new Mock<ILogger<ComentariosTareaController>>();
            _controller = new ComentariosTareaController(_mockService.Object, _mockLogger.Object);
        }

        [Fact]
        public async Task GetAll_DebeRetornarOkConListaDeComentarios()
        {
            // Arrange
            var comentarios = new List<ComentarioTareaDto>
            {
                new ComentarioTareaDto {
                    Id = 1,
                    TareaId = 1,
                    UsuarioId = 1,
                    Contenido = "Comentario 1",
                    FechaCreacion = DateTime.UtcNow,
                    Activo = true
                },
                new ComentarioTareaDto {
                    Id = 2,
                    TareaId = 1,
                    UsuarioId = 2,
                    Contenido = "Comentario 2",
                    FechaCreacion = DateTime.UtcNow,
                    Activo = true
                }
            };

            _mockService.Setup(service => service.GetAllAsync(It.IsAny<System.Threading.CancellationToken>()))
                .ReturnsAsync(comentarios);

            // Act
            var result = await _controller.GetAll();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsAssignableFrom<IEnumerable<ComentarioTareaDto>>(okResult.Value);
            Assert.Equal(2, returnValue.Count());
        }

        [Fact]
        public async Task GetById_ConIdExistente_DebeRetornarOkConComentario()
        {
            // Arrange
            var comentario = new ComentarioTareaDto
            {
                Id = 1,
                TareaId = 1,
                UsuarioId = 1,
                Contenido = "Comentario Test",
                FechaCreacion = DateTime.UtcNow,
                Activo = true
            };

            _mockService.Setup(service => service.GetByIdAsync(1, It.IsAny<System.Threading.CancellationToken>()))
                .ReturnsAsync(comentario);

            // Act
            var result = await _controller.GetById(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsType<ComentarioTareaDto>(okResult.Value);
            Assert.Equal(1, returnValue.Id);
            Assert.Equal("Comentario Test", returnValue.Contenido);
        }

        [Fact]
        public async Task GetById_ConIdInexistente_DebeRetornarNotFound()
        {
            // Arrange
            _mockService.Setup(service => service.GetByIdAsync(999, It.IsAny<System.Threading.CancellationToken>()))
                .ReturnsAsync((ComentarioTareaDto)null);

            // Act
            var result = await _controller.GetById(999);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task Create_ConDatosValidos_DebeRetornarCreatedAtActionConComentario()
        {
            // Arrange
            var createDto = new CreateComentarioTareaDto
            {
                TareaId = 1,
                UsuarioId = 1,
                Contenido = "Nuevo Comentario",
                TieneArchivosAdjuntos = false,
                Activo = true
            };

            var createdComentario = new ComentarioTareaDto
            {
                Id = 1,
                TareaId = 1,
                UsuarioId = 1,
                Contenido = "Nuevo Comentario",
                TieneArchivosAdjuntos = false,
                Activo = true,
                FechaCreacion = DateTime.UtcNow
            };

            _mockService.Setup(service => service.CreateAsync(createDto, It.IsAny<System.Threading.CancellationToken>()))
                .ReturnsAsync(createdComentario);

            // Act
            var result = await _controller.Create(createDto);

            // Assert
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result);
            Assert.Equal(nameof(ComentariosTareaController.GetById), createdAtActionResult.ActionName);
            Assert.Equal(1, createdAtActionResult.RouteValues["id"]);
            var returnValue = Assert.IsType<ComentarioTareaDto>(createdAtActionResult.Value);
            Assert.Equal(1, returnValue.Id);
            Assert.Equal("Nuevo Comentario", returnValue.Contenido);
        }

        [Fact]
        public async Task Update_ConIdYDtoValidos_DebeRetornarNoContent()
        {
            // Arrange
            var updateDto = new UpdateComentarioTareaDto
            {
                Id = 1,
                Contenido = "Comentario Actualizado",
                TieneArchivosAdjuntos = true,
                Activo = true
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
            var updateDto = new UpdateComentarioTareaDto
            {
                Id = 2,
                Contenido = "Comentario Actualizado",
                TieneArchivosAdjuntos = true,
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
            var updateDto = new UpdateComentarioTareaDto
            {
                Id = 999,
                Contenido = "Comentario Actualizado",
                TieneArchivosAdjuntos = true,
                Activo = true
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