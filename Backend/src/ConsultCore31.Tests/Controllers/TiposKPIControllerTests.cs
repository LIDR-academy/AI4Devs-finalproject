using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using ConsultCore31.Application.DTOs.TipoKPI;
using ConsultCore31.Application.Interfaces;
using ConsultCore31.WebAPI.Controllers.V1;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace ConsultCore31.Tests.Controllers
{
    /// <summary>
    /// Pruebas para el controlador de tipos de KPI
    /// </summary>
    public class TiposKPIControllerTests
    {
        private readonly Mock<ITipoKPIService> _mockService;
        private readonly Mock<ILogger<TiposKPIController>> _mockLogger;
        private readonly TiposKPIController _controller;

        public TiposKPIControllerTests()
        {
            _mockService = new Mock<ITipoKPIService>();
            _mockLogger = new Mock<ILogger<TiposKPIController>>();
            _controller = new TiposKPIController(_mockService.Object, _mockLogger.Object);
        }

        [Fact]
        public async Task GetAll_DebeRetornarOkConListaDeTipos()
        {
            // Arrange
            var tipos = new List<TipoKPIDto>
            {
                new TipoKPIDto { Id = 1, Nombre = "Financiero", Descripcion = "KPI financiero", FechaCreacion = DateTime.UtcNow },
                new TipoKPIDto { Id = 2, Nombre = "Operativo", Descripcion = "KPI operativo", FechaCreacion = DateTime.UtcNow }
            };

            _mockService.Setup(service => service.GetAllAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(tipos);

            // Act
            var result = await _controller.GetAll();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsAssignableFrom<IEnumerable<TipoKPIDto>>(okResult.Value);
            Assert.Equal(2, ((List<TipoKPIDto>)returnValue).Count);
        }

        [Fact]
        public async Task GetById_ConIdExistente_DebeRetornarOkConTipo()
        {
            // Arrange
            var tipo = new TipoKPIDto
            {
                Id = 1,
                Nombre = "Financiero",
                Descripcion = "KPI financiero",
                FechaCreacion = DateTime.UtcNow
            };

            _mockService.Setup(service => service.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(tipo);

            // Act
            var result = await _controller.GetById(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsType<TipoKPIDto>(okResult.Value);
            Assert.Equal(1, returnValue.Id);
            Assert.Equal("Financiero", returnValue.Nombre);
        }

        [Fact]
        public async Task GetById_ConIdInexistente_DebeRetornarNotFound()
        {
            // Arrange
            _mockService.Setup(service => service.GetByIdAsync(999, It.IsAny<CancellationToken>()))
                .ReturnsAsync((TipoKPIDto)null);

            // Act
            var result = await _controller.GetById(999);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task Create_ConDatosValidos_DebeRetornarCreatedAtAction()
        {
            // Arrange
            var createDto = new CreateTipoKPIDto
            {
                Nombre = "Estratégico",
                Descripcion = "KPI estratégico",
                Activo = true
            };

            var createdDto = new TipoKPIDto
            {
                Id = 3,
                Nombre = "Estratégico",
                Descripcion = "KPI estratégico",
                Activo = true,
                FechaCreacion = DateTime.UtcNow
            };

            _mockService.Setup(service => service.CreateAsync(createDto, It.IsAny<CancellationToken>()))
                .ReturnsAsync(createdDto);

            // Act
            var result = await _controller.Create(createDto);

            // Assert
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result);
            Assert.Equal(nameof(TiposKPIController.GetById), createdAtActionResult.ActionName);
            Assert.Equal(3, createdAtActionResult.RouteValues["id"]);
            var returnValue = Assert.IsType<TipoKPIDto>(createdAtActionResult.Value);
            Assert.Equal(3, returnValue.Id);
            Assert.Equal("Estratégico", returnValue.Nombre);
        }

        [Fact]
        public async Task Update_ConIdYDtoValidos_DebeRetornarOk()
        {
            // Arrange
            var updateDto = new UpdateTipoKPIDto
            {
                Id = 1,
                Nombre = "Financiero Actualizado",
                Descripcion = "Descripción actualizada",
                Activo = true
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
            var updateDto = new UpdateTipoKPIDto
            {
                Id = 2,
                Nombre = "Financiero Actualizado",
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
            var updateDto = new UpdateTipoKPIDto
            {
                Id = 999,
                Nombre = "Tipo Inexistente",
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
