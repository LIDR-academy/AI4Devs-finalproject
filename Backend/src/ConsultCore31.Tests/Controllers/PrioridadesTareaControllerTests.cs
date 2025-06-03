using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using ConsultCore31.Application.DTOs.PrioridadTarea;
using ConsultCore31.Application.Interfaces;
using ConsultCore31.WebAPI.Controllers.V1;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace ConsultCore31.Tests.Controllers
{
    /// <summary>
    /// Pruebas para el controlador de prioridades de tarea
    /// </summary>
    public class PrioridadesTareaControllerTests
    {
        private readonly Mock<IPrioridadTareaService> _mockService;
        private readonly Mock<ILogger<PrioridadesTareaController>> _mockLogger;
        private readonly PrioridadesTareaController _controller;

        public PrioridadesTareaControllerTests()
        {
            _mockService = new Mock<IPrioridadTareaService>();
            _mockLogger = new Mock<ILogger<PrioridadesTareaController>>();
            _controller = new PrioridadesTareaController(_mockService.Object, _mockLogger.Object);
        }

        [Fact]
        public async Task GetAll_DebeRetornarOkConListaDePrioridades()
        {
            // Arrange
            var prioridades = new List<PrioridadTareaDto>
            {
                new PrioridadTareaDto { Id = 1, Nombre = "Alta", Descripcion = "Prioridad alta", FechaCreacion = DateTime.UtcNow },
                new PrioridadTareaDto { Id = 2, Nombre = "Media", Descripcion = "Prioridad media", FechaCreacion = DateTime.UtcNow }
            };

            _mockService.Setup(service => service.GetAllAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(prioridades);

            // Act
            var result = await _controller.GetAll();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsAssignableFrom<IEnumerable<PrioridadTareaDto>>(okResult.Value);
            Assert.Equal(2, ((List<PrioridadTareaDto>)returnValue).Count);
        }

        [Fact]
        public async Task GetById_ConIdExistente_DebeRetornarOkConPrioridad()
        {
            // Arrange
            var prioridad = new PrioridadTareaDto
            {
                Id = 1,
                Nombre = "Alta",
                Descripcion = "Prioridad alta",
                FechaCreacion = DateTime.UtcNow
            };

            _mockService.Setup(service => service.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(prioridad);

            // Act
            var result = await _controller.GetById(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsType<PrioridadTareaDto>(okResult.Value);
            Assert.Equal(1, returnValue.Id);
            Assert.Equal("Alta", returnValue.Nombre);
        }

        [Fact]
        public async Task GetById_ConIdInexistente_DebeRetornarNotFound()
        {
            // Arrange
            _mockService.Setup(service => service.GetByIdAsync(999, It.IsAny<CancellationToken>()))
                .ReturnsAsync((PrioridadTareaDto)null);

            // Act
            var result = await _controller.GetById(999);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task Create_ConDatosValidos_DebeRetornarCreatedAtAction()
        {
            // Arrange
            var createDto = new CreatePrioridadTareaDto
            {
                Nombre = "Baja",
                Descripcion = "Prioridad baja",
                Activa = true
            };

            var createdDto = new PrioridadTareaDto
            {
                Id = 3,
                Nombre = "Baja",
                Descripcion = "Prioridad baja",
                Activa = true,
                FechaCreacion = DateTime.UtcNow
            };

            _mockService.Setup(service => service.CreateAsync(createDto, It.IsAny<CancellationToken>()))
                .ReturnsAsync(createdDto);

            // Act
            var result = await _controller.Create(createDto);

            // Assert
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result);
            Assert.Equal(nameof(PrioridadesTareaController.GetById), createdAtActionResult.ActionName);
            Assert.Equal(3, createdAtActionResult.RouteValues["id"]);
            var returnValue = Assert.IsType<PrioridadTareaDto>(createdAtActionResult.Value);
            Assert.Equal(3, returnValue.Id);
            Assert.Equal("Baja", returnValue.Nombre);
        }

        [Fact]
        public async Task Update_ConIdYDtoValidos_DebeRetornarOk()
        {
            // Arrange
            var updateDto = new UpdatePrioridadTareaDto
            {
                Id = 1,
                Nombre = "Alta Actualizada",
                Descripcion = "Descripción actualizada",
                Activa = true
            };

            _mockService.Setup(service => service.UpdateAsync(updateDto, It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.Update(1, updateDto);

            // Assert
            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task Update_ConIdNoCoincidente_DebeRetornarBadRequest()
        {
            // Arrange
            var updateDto = new UpdatePrioridadTareaDto
            {
                Id = 2,
                Nombre = "Alta Actualizada",
                Descripcion = "Descripción actualizada",
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
            var updateDto = new UpdatePrioridadTareaDto
            {
                Id = 999,
                Nombre = "Prioridad Inexistente",
                Descripcion = "Descripción inexistente",
                Activa = true
            };

            _mockService.Setup(service => service.UpdateAsync(updateDto, It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);

            // Act
            var result = await _controller.Update(999, updateDto);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task Delete_ConIdExistente_DebeRetornarOk()
        {
            // Arrange
            _mockService.Setup(service => service.DeleteAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.Delete(1);

            // Assert
            Assert.IsType<OkObjectResult>(result);
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
