using ConsultCore31.Application.DTOs.Tarea;
using ConsultCore31.Application.Interfaces;
using ConsultCore31.WebAPI.Controllers.V1;

using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

using Moq;

namespace ConsultCore31.Tests.Controllers
{
    /// <summary>
    /// Pruebas de integración para el controlador de tareas
    /// </summary>
    public class TareasControllerTests
    {
        private readonly Mock<ITareaService> _mockService;
        private readonly Mock<ILogger<TareasController>> _mockLogger;
        private readonly TareasController _controller;

        public TareasControllerTests()
        {
            _mockService = new Mock<ITareaService>();
            _mockLogger = new Mock<ILogger<TareasController>>();
            _controller = new TareasController(_mockService.Object, _mockLogger.Object);
        }

        [Fact]
        public async Task GetAll_DebeRetornarOkConListaDeTareas()
        {
            // Arrange
            var tareas = new List<TareaDto>
            {
                new TareaDto {
                    Id = 1,
                    Titulo = "Tarea 1",
                    ProyectoId = 1,
                    EstadoTareaId = 1,
                    PrioridadTareaId = 1,
                    FechaCreacion = DateTime.UtcNow
                },
                new TareaDto {
                    Id = 2,
                    Titulo = "Tarea 2",
                    ProyectoId = 1,
                    EstadoTareaId = 1,
                    PrioridadTareaId = 2,
                    FechaCreacion = DateTime.UtcNow
                }
            };

            _mockService.Setup(service => service.GetAllAsync(It.IsAny<System.Threading.CancellationToken>()))
                .ReturnsAsync(tareas);

            // Act
            var result = await _controller.GetAll();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsAssignableFrom<IEnumerable<TareaDto>>(okResult.Value);
            Assert.Equal(2, returnValue.Count());
        }

        [Fact]
        public async Task GetById_ConIdExistente_DebeRetornarOkConTarea()
        {
            // Arrange
            var tarea = new TareaDto
            {
                Id = 1,
                Titulo = "Tarea Test",
                ProyectoId = 1,
                EstadoTareaId = 1,
                PrioridadTareaId = 1,
                FechaCreacion = DateTime.UtcNow
            };

            _mockService.Setup(service => service.GetByIdAsync(1, It.IsAny<System.Threading.CancellationToken>()))
                .ReturnsAsync(tarea);

            // Act
            var result = await _controller.GetById(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsType<TareaDto>(okResult.Value);
            Assert.Equal(1, returnValue.Id);
            Assert.Equal("Tarea Test", returnValue.Titulo);
        }

        [Fact]
        public async Task GetById_ConIdInexistente_DebeRetornarNotFound()
        {
            // Arrange
            _mockService.Setup(service => service.GetByIdAsync(999, It.IsAny<System.Threading.CancellationToken>()))
                .ReturnsAsync((TareaDto)null);

            // Act
            var result = await _controller.GetById(999);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task Create_ConDatosValidos_DebeRetornarCreatedAtActionConTarea()
        {
            // Arrange
            var createDto = new CreateTareaDto
            {
                Titulo = "Nueva Tarea",
                ProyectoId = 1,
                EstadoTareaId = 1,
                PrioridadTareaId = 1,
                CreadoPorId = 1,
                Activa = true
            };

            var createdTarea = new TareaDto
            {
                Id = 1,
                Titulo = "Nueva Tarea",
                ProyectoId = 1,
                EstadoTareaId = 1,
                PrioridadTareaId = 1,
                CreadoPorId = 1,
                Activa = true,
                FechaCreacion = DateTime.UtcNow
            };

            _mockService.Setup(service => service.CreateAsync(createDto, It.IsAny<System.Threading.CancellationToken>()))
                .ReturnsAsync(createdTarea);

            // Act
            var result = await _controller.Create(createDto);

            // Assert
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result);
            Assert.Equal(nameof(TareasController.GetById), createdAtActionResult.ActionName);
            Assert.Equal(1, createdAtActionResult.RouteValues["id"]);
            var returnValue = Assert.IsType<TareaDto>(createdAtActionResult.Value);
            Assert.Equal(1, returnValue.Id);
            Assert.Equal("Nueva Tarea", returnValue.Titulo);
        }

        [Fact]
        public async Task Update_ConIdYDtoValidos_DebeRetornarNoContent()
        {
            // Arrange
            var updateDto = new UpdateTareaDto
            {
                Id = 1,
                Titulo = "Tarea Actualizada",
                ProyectoId = 1,
                EstadoTareaId = 2,
                PrioridadTareaId = 2,
                Activa = true
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
            var updateDto = new UpdateTareaDto
            {
                Id = 2,
                Titulo = "Tarea Actualizada",
                ProyectoId = 1,
                EstadoTareaId = 2,
                PrioridadTareaId = 2,
                Activa = true
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
            var updateDto = new UpdateTareaDto
            {
                Id = 999,
                Titulo = "Tarea Actualizada",
                ProyectoId = 1,
                EstadoTareaId = 2,
                PrioridadTareaId = 2,
                Activa = true
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