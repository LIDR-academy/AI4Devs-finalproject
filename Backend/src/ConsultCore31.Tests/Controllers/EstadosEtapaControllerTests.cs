using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using ConsultCore31.Application.DTOs.EstadoEtapa;
using ConsultCore31.Application.Interfaces;
using ConsultCore31.WebAPI.Controllers.V1;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace ConsultCore31.Tests.Controllers
{
    /// <summary>
    /// Pruebas para el controlador de estados de etapa
    /// </summary>
    public class EstadosEtapaControllerTests
    {
        private readonly Mock<IEstadoEtapaService> _mockService;
        private readonly Mock<ILogger<EstadosEtapaController>> _mockLogger;
        private readonly EstadosEtapaController _controller;

        public EstadosEtapaControllerTests()
        {
            _mockService = new Mock<IEstadoEtapaService>();
            _mockLogger = new Mock<ILogger<EstadosEtapaController>>();
            _controller = new EstadosEtapaController(_mockService.Object, _mockLogger.Object);
        }

        [Fact]
        public async Task GetAll_DebeRetornarOkConListaDeEstados()
        {
            // Arrange
            var estados = new List<EstadoEtapaDto>
            {
                new EstadoEtapaDto { Id = 1, Nombre = "Planificación", Descripcion = "Etapa de planificación", FechaCreacion = DateTime.UtcNow },
                new EstadoEtapaDto { Id = 2, Nombre = "Ejecución", Descripcion = "Etapa de ejecución", FechaCreacion = DateTime.UtcNow }
            };

            _mockService.Setup(service => service.GetAllAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(estados);

            // Act
            var result = await _controller.GetAll();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsAssignableFrom<IEnumerable<EstadoEtapaDto>>(okResult.Value);
            Assert.Equal(2, ((List<EstadoEtapaDto>)returnValue).Count);
        }

        [Fact]
        public async Task GetById_ConIdExistente_DebeRetornarOkConEstado()
        {
            // Arrange
            var estado = new EstadoEtapaDto
            {
                Id = 1,
                Nombre = "Planificación",
                Descripcion = "Etapa de planificación",
                FechaCreacion = DateTime.UtcNow
            };

            _mockService.Setup(service => service.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(estado);

            // Act
            var result = await _controller.GetById(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsType<EstadoEtapaDto>(okResult.Value);
            Assert.Equal(1, returnValue.Id);
            Assert.Equal("Planificación", returnValue.Nombre);
        }

        [Fact]
        public async Task GetById_ConIdInexistente_DebeRetornarNotFound()
        {
            // Arrange
            _mockService.Setup(service => service.GetByIdAsync(999, It.IsAny<CancellationToken>()))
                .ReturnsAsync((EstadoEtapaDto)null);

            // Act
            var result = await _controller.GetById(999);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task Create_ConDatosValidos_DebeRetornarCreatedAtAction()
        {
            // Arrange
            var createDto = new CreateEstadoEtapaDto
            {
                Nombre = "Cierre",
                Descripcion = "Etapa de cierre",
                Activo = true
            };

            var createdDto = new EstadoEtapaDto
            {
                Id = 3,
                Nombre = "Cierre",
                Descripcion = "Etapa de cierre",
                Activo = true,
                FechaCreacion = DateTime.UtcNow
            };

            _mockService.Setup(service => service.CreateAsync(createDto, It.IsAny<CancellationToken>()))
                .ReturnsAsync(createdDto);

            // Act
            var result = await _controller.Create(createDto);

            // Assert
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result);
            Assert.Equal(nameof(EstadosEtapaController.GetById), createdAtActionResult.ActionName);
            Assert.Equal(3, createdAtActionResult.RouteValues["id"]);
            var returnValue = Assert.IsType<EstadoEtapaDto>(createdAtActionResult.Value);
            Assert.Equal(3, returnValue.Id);
            Assert.Equal("Cierre", returnValue.Nombre);
        }

        [Fact]
        public async Task Update_ConIdYDtoValidos_DebeRetornarNoContent()
        {
            // Arrange
            var updateDto = new UpdateEstadoEtapaDto
            {
                Id = 1,
                Nombre = "Planificación Actualizada",
                Descripcion = "Descripción actualizada",
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
            var updateDto = new UpdateEstadoEtapaDto
            {
                Id = 2,
                Nombre = "Planificación Actualizada",
                Descripcion = "Descripción actualizada",
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
            var updateDto = new UpdateEstadoEtapaDto
            {
                Id = 999,
                Nombre = "Estado Inexistente",
                Descripcion = "Descripción inexistente",
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


