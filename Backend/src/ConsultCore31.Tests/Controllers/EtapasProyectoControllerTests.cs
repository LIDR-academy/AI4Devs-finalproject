using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ConsultCore31.Application.DTOs.EtapaProyecto;
using ConsultCore31.Application.Interfaces;
using ConsultCore31.WebAPI.Controllers.V1;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace ConsultCore31.Tests.Controllers
{
    /// <summary>
    /// Pruebas de integración para el controlador de etapas de proyecto
    /// </summary>
    public class EtapasProyectoControllerTests
    {
        private readonly Mock<IEtapaProyectoService> _mockService;
        private readonly Mock<ILogger<EtapasProyectoController>> _mockLogger;
        private readonly EtapasProyectoController _controller;

        public EtapasProyectoControllerTests()
        {
            _mockService = new Mock<IEtapaProyectoService>();
            _mockLogger = new Mock<ILogger<EtapasProyectoController>>();
            _controller = new EtapasProyectoController(_mockService.Object, _mockLogger.Object);
        }

        [Fact]
        public async Task GetAll_DebeRetornarOkConListaDeEtapasProyecto()
        {
            // Arrange
            var etapasProyecto = new List<EtapaProyectoDto>
            {
                new EtapaProyectoDto { 
                    Id = 1, 
                    Nombre = "Etapa 1", 
                    ProyectoId = 1,
                    Descripcion = "Descripción de la etapa 1",
                    Orden = 1,
                    EstadoEtapaId = 1,
                    FechaCreacion = DateTime.UtcNow 
                },
                new EtapaProyectoDto { 
                    Id = 2, 
                    Nombre = "Etapa 2", 
                    ProyectoId = 1,
                    Descripcion = "Descripción de la etapa 2",
                    Orden = 2,
                    EstadoEtapaId = 1,
                    FechaCreacion = DateTime.UtcNow 
                }
            };

            _mockService.Setup(service => service.GetAllAsync(It.IsAny<System.Threading.CancellationToken>()))
                .ReturnsAsync(etapasProyecto);

            // Act
            var result = await _controller.GetAll();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsAssignableFrom<IEnumerable<EtapaProyectoDto>>(okResult.Value);
            Assert.Equal(2, returnValue.Count());
        }

        [Fact]
        public async Task GetById_ConIdExistente_DebeRetornarOkConEtapaProyecto()
        {
            // Arrange
            var etapaProyecto = new EtapaProyectoDto
            {
                Id = 1,
                Nombre = "Etapa Test",
                ProyectoId = 1,
                Descripcion = "Descripción de la etapa de prueba",
                Orden = 1,
                EstadoEtapaId = 1,
                FechaCreacion = DateTime.UtcNow
            };

            _mockService.Setup(service => service.GetByIdAsync(1, It.IsAny<System.Threading.CancellationToken>()))
                .ReturnsAsync(etapaProyecto);

            // Act
            var result = await _controller.GetById(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsType<EtapaProyectoDto>(okResult.Value);
            Assert.Equal(1, returnValue.Id);
            Assert.Equal("Etapa Test", returnValue.Nombre);
        }

        [Fact]
        public async Task GetById_ConIdInexistente_DebeRetornarNotFound()
        {
            // Arrange
            _mockService.Setup(service => service.GetByIdAsync(999, It.IsAny<System.Threading.CancellationToken>()))
                .ReturnsAsync((EtapaProyectoDto)null);

            // Act
            var result = await _controller.GetById(999);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task Create_ConDatosValidos_DebeRetornarCreatedAtActionConEtapaProyecto()
        {
            // Arrange
            var createDto = new CreateEtapaProyectoDto
            {
                Nombre = "Nueva Etapa",
                ProyectoId = 1,
                Descripcion = "Descripción de la nueva etapa",
                Orden = 1,
                FechaInicio = DateTime.UtcNow,
                FechaFin = DateTime.UtcNow.AddMonths(1),
                EstadoEtapaId = 1,
                Activa = true
            };

            var createdEtapaProyecto = new EtapaProyectoDto
            {
                Id = 1,
                Nombre = "Nueva Etapa",
                ProyectoId = 1,
                Descripcion = "Descripción de la nueva etapa",
                Orden = 1,
                FechaInicio = DateTime.UtcNow,
                FechaFin = DateTime.UtcNow.AddMonths(1),
                EstadoEtapaId = 1,
                Activa = true,
                FechaCreacion = DateTime.UtcNow
            };

            _mockService.Setup(service => service.CreateAsync(createDto, It.IsAny<System.Threading.CancellationToken>()))
                .ReturnsAsync(createdEtapaProyecto);

            // Act
            var result = await _controller.Create(createDto);

            // Assert
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result);
            Assert.Equal(nameof(EtapasProyectoController.GetById), createdAtActionResult.ActionName);
            Assert.Equal(1, createdAtActionResult.RouteValues["id"]);
            var returnValue = Assert.IsType<EtapaProyectoDto>(createdAtActionResult.Value);
            Assert.Equal(1, returnValue.Id);
            Assert.Equal("Nueva Etapa", returnValue.Nombre);
        }

        [Fact]
        public async Task Update_ConIdYDtoValidos_DebeRetornarNoContent()
        {
            // Arrange
            var updateDto = new UpdateEtapaProyectoDto
            {
                Id = 1,
                Nombre = "Etapa Actualizada",
                ProyectoId = 1,
                Descripcion = "Descripción de la etapa actualizada",
                Orden = 2,
                FechaInicio = DateTime.UtcNow,
                FechaFin = DateTime.UtcNow.AddMonths(2),
                EstadoEtapaId = 2,
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
            var updateDto = new UpdateEtapaProyectoDto
            {
                Id = 2,
                Nombre = "Etapa Actualizada",
                ProyectoId = 1,
                Descripcion = "Descripción de la etapa actualizada",
                Orden = 2,
                FechaInicio = DateTime.UtcNow,
                FechaFin = DateTime.UtcNow.AddMonths(2),
                EstadoEtapaId = 2,
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
            var updateDto = new UpdateEtapaProyectoDto
            {
                Id = 999,
                Nombre = "Etapa Actualizada",
                ProyectoId = 1,
                Descripcion = "Descripción de la etapa actualizada",
                Orden = 2,
                FechaInicio = DateTime.UtcNow,
                FechaFin = DateTime.UtcNow.AddMonths(2),
                EstadoEtapaId = 2,
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
