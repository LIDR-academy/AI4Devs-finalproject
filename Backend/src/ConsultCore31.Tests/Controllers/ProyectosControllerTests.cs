using ConsultCore31.Application.DTOs.Proyecto;
using ConsultCore31.Application.Interfaces;
using ConsultCore31.WebAPI.Controllers.V1;

using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

using Moq;

namespace ConsultCore31.Tests.Controllers
{
    /// <summary>
    /// Pruebas para el controlador de proyectos
    /// </summary>
    public class ProyectosControllerTests
    {
        private readonly Mock<IProyectoService> _mockService;
        private readonly Mock<ILogger<ProyectosController>> _mockLogger;
        private readonly ProyectosController _controller;

        public ProyectosControllerTests()
        {
            _mockService = new Mock<IProyectoService>();
            _mockLogger = new Mock<ILogger<ProyectosController>>();
            _controller = new ProyectosController(_mockService.Object, _mockLogger.Object);
        }

        [Fact]
        public async Task GetAll_DebeRetornarOkConListaDeProyectos()
        {
            // Arrange
            var proyectos = new List<ProyectoDto>
            {
                new ProyectoDto {
                    Id = 1,
                    Nombre = "Proyecto 1",
                    Codigo = "PRO-001",
                    Descripcion = "Descripción del proyecto 1",
                    FechaInicio = DateTime.UtcNow,
                    FechaFinPlanificada = DateTime.UtcNow.AddMonths(3),
                    EstadoProyectoId = 1,
                    TipoProyectoId = 1,
                    ClienteId = 1,
                    FechaCreacion = DateTime.UtcNow
                },
                new ProyectoDto {
                    Id = 2,
                    Nombre = "Proyecto 2",
                    Codigo = "PRO-002",
                    Descripcion = "Descripción del proyecto 2",
                    FechaInicio = DateTime.UtcNow,
                    FechaFinPlanificada = DateTime.UtcNow.AddMonths(6),
                    EstadoProyectoId = 1,
                    TipoProyectoId = 2,
                    ClienteId = 2,
                    FechaCreacion = DateTime.UtcNow
                }
            };

            _mockService.Setup(service => service.GetAllAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(proyectos);

            // Act
            var result = await _controller.GetAll().ConfigureAwait(true);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsAssignableFrom<IEnumerable<ProyectoDto>>(okResult.Value);
            Assert.Equal(2, ((List<ProyectoDto>)returnValue).Count);
        }

        [Fact]
        public async Task GetById_ConIdExistente_DebeRetornarOkConProyecto()
        {
            // Arrange
            var proyecto = new ProyectoDto
            {
                Id = 1,
                Nombre = "Proyecto Test",
                Codigo = "PRO-TEST",
                Descripcion = "Descripción del proyecto de prueba",
                FechaInicio = DateTime.UtcNow,
                FechaFinPlanificada = DateTime.UtcNow.AddMonths(3),
                EstadoProyectoId = 1,
                TipoProyectoId = 1,
                ClienteId = 1,
                FechaCreacion = DateTime.UtcNow
            };

            _mockService.Setup(service => service.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(proyecto);

            // Act
            var result = await _controller.GetById(1).ConfigureAwait(true);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsType<ProyectoDto>(okResult.Value);
            Assert.Equal(1, returnValue.Id);
            Assert.Equal("Proyecto Test", returnValue.Nombre);
            Assert.Equal("PRO-TEST", returnValue.Codigo);
        }

        [Fact]
        public async Task GetById_ConIdInexistente_DebeRetornarNotFound()
        {
            // Arrange
            _mockService.Setup(service => service.GetByIdAsync(999, It.IsAny<CancellationToken>()))
                .ReturnsAsync((ProyectoDto)null);

            // Act
            var result = await _controller.GetById(999).ConfigureAwait(true);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task Create_ConDatosValidos_DebeRetornarCreatedAtAction()
        {
            // Arrange
            var createDto = new CreateProyectoDto
            {
                Nombre = "Nuevo Proyecto",
                Codigo = "PRO-NUEVO",
                Descripcion = "Descripción del nuevo proyecto",
                FechaInicio = DateTime.UtcNow,
                FechaFinPlanificada = DateTime.UtcNow.AddMonths(3),
                EstadoProyectoId = 1,
                TipoProyectoId = 1,
                ClienteId = 1
            };

            var createdDto = new ProyectoDto
            {
                Id = 1,
                Nombre = "Nuevo Proyecto",
                Codigo = "PRO-NUEVO",
                Descripcion = "Descripción del nuevo proyecto",
                FechaInicio = DateTime.UtcNow,
                FechaFinPlanificada = DateTime.UtcNow.AddMonths(3),
                EstadoProyectoId = 1,
                TipoProyectoId = 1,
                ClienteId = 1,
                FechaCreacion = DateTime.UtcNow
            };

            _mockService.Setup(service => service.CreateAsync(createDto, It.IsAny<CancellationToken>()))
                .ReturnsAsync(createdDto);

            // Act
            var result = await _controller.Create(createDto);

            // Assert
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result);
            Assert.Equal(nameof(ProyectosController.GetById), createdAtActionResult.ActionName);
            Assert.Equal(1, createdAtActionResult.RouteValues["id"]);
            var returnValue = Assert.IsType<ProyectoDto>(createdAtActionResult.Value);
            Assert.Equal(1, returnValue.Id);
            Assert.Equal("Nuevo Proyecto", returnValue.Nombre);
            Assert.Equal("PRO-NUEVO", returnValue.Codigo);
        }

        [Fact]
        public async Task Update_ConIdYDtoValidos_DebeRetornarNoContent()
        {
            // Arrange
            var updateDto = new UpdateProyectoDto
            {
                Id = 1,
                Nombre = "Proyecto Actualizado",
                Codigo = "PRO-ACT",
                Descripcion = "Descripción del proyecto actualizado",
                FechaInicio = DateTime.UtcNow,
                FechaFinPlanificada = DateTime.UtcNow.AddMonths(4),
                FechaFinReal = DateTime.UtcNow.AddMonths(5),
                EstadoProyectoId = 2,
                TipoProyectoId = 2,
                ClienteId = 2
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
            var updateDto = new UpdateProyectoDto
            {
                Id = 2,
                Nombre = "Proyecto Actualizado",
                Codigo = "PRO-ACT",
                Descripcion = "Descripción del proyecto actualizado",
                FechaInicio = DateTime.UtcNow,
                FechaFinPlanificada = DateTime.UtcNow.AddMonths(4),
                EstadoProyectoId = 2,
                TipoProyectoId = 2,
                ClienteId = 2
            };

            // Act
            var result = await _controller.Update(1, updateDto).ConfigureAwait(true);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task Update_ConIdInexistente_DebeRetornarNotFound()
        {
            // Arrange
            var updateDto = new UpdateProyectoDto
            {
                Id = 999,
                Nombre = "Proyecto Actualizado",
                Codigo = "PRO-ACT",
                Descripcion = "Descripción del proyecto actualizado",
                FechaInicio = DateTime.UtcNow,
                FechaFinPlanificada = DateTime.UtcNow.AddMonths(4),
                EstadoProyectoId = 2,
                TipoProyectoId = 2,
                ClienteId = 2
            };

            _mockService.Setup(service => service.UpdateAsync(updateDto, It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);

            // Act
            var result = await _controller.Update(999, updateDto).ConfigureAwait(true);

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
            var result = await _controller.Delete(1).ConfigureAwait(true);

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
            var result = await _controller.Delete(999).ConfigureAwait(true);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }
    }
}