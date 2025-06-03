using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using ConsultCore31.Application.DTOs.Moneda;
using ConsultCore31.Application.Interfaces;
using ConsultCore31.WebAPI.Controllers.V1;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace ConsultCore31.Tests.Controllers
{
    /// <summary>
    /// Pruebas para el controlador de monedas
    /// </summary>
    public class MonedasControllerTests
    {
        private readonly Mock<IMonedaService> _mockService;
        private readonly Mock<ILogger<MonedasController>> _mockLogger;
        private readonly MonedasController _controller;

        public MonedasControllerTests()
        {
            _mockService = new Mock<IMonedaService>();
            _mockLogger = new Mock<ILogger<MonedasController>>();
            _controller = new MonedasController(_mockService.Object, _mockLogger.Object);
        }

        [Fact]
        public async Task GetAll_DebeRetornarOkConListaDeMonedas()
        {
            // Arrange
            var monedas = new List<MonedaDto>
            {
                new MonedaDto { Id = 1, Codigo = "USD", Nombre = "Dólar Estadounidense", Simbolo = "$", TasaCambio = 1, FechaCreacion = DateTime.UtcNow },
                new MonedaDto { Id = 2, Codigo = "EUR", Nombre = "Euro", Simbolo = "€", TasaCambio = 0.85m, FechaCreacion = DateTime.UtcNow }
            };

            _mockService.Setup(service => service.GetAllAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(monedas);

            // Act
            var result = await _controller.GetAll();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsAssignableFrom<IEnumerable<MonedaDto>>(okResult.Value);
            Assert.Equal(2, ((List<MonedaDto>)returnValue).Count);
        }

        [Fact]
        public async Task GetById_ConIdExistente_DebeRetornarOkConMoneda()
        {
            // Arrange
            var moneda = new MonedaDto
            {
                Id = 1,
                Codigo = "USD",
                Nombre = "Dólar Estadounidense",
                Simbolo = "$",
                TasaCambio = 1,
                FechaCreacion = DateTime.UtcNow
            };

            _mockService.Setup(service => service.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(moneda);

            // Act
            var result = await _controller.GetById(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsType<MonedaDto>(okResult.Value);
            Assert.Equal(1, returnValue.Id);
            Assert.Equal("USD", returnValue.Codigo);
        }

        [Fact]
        public async Task GetById_ConIdInexistente_DebeRetornarNotFound()
        {
            // Arrange
            _mockService.Setup(service => service.GetByIdAsync(999, It.IsAny<CancellationToken>()))
                .ReturnsAsync((MonedaDto)null);

            // Act
            var result = await _controller.GetById(999);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task Create_ConDatosValidos_DebeRetornarCreatedAtAction()
        {
            // Arrange
            var createDto = new CreateMonedaDto
            {
                Codigo = "MXN",
                Nombre = "Peso Mexicano",
                Simbolo = "$",
                TasaCambio = 20.5m,
                EsPredeterminada = false,
                Activa = true
            };

            var createdDto = new MonedaDto
            {
                Id = 3,
                Codigo = "MXN",
                Nombre = "Peso Mexicano",
                Simbolo = "$",
                TasaCambio = 20.5m,
                EsPredeterminada = false,
                Activa = true,
                FechaCreacion = DateTime.UtcNow
            };

            _mockService.Setup(service => service.CreateAsync(createDto, It.IsAny<CancellationToken>()))
                .ReturnsAsync(createdDto);

            // Act
            var result = await _controller.Create(createDto);

            // Assert
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result);
            Assert.Equal(nameof(MonedasController.GetById), createdAtActionResult.ActionName);
            Assert.Equal(3, createdAtActionResult.RouteValues["id"]);
            var returnValue = Assert.IsType<MonedaDto>(createdAtActionResult.Value);
            Assert.Equal(3, returnValue.Id);
            Assert.Equal("MXN", returnValue.Codigo);
        }

        [Fact]
        public async Task Update_ConIdYDtoValidos_DebeRetornarNoContent()
        {
            // Arrange
            var updateDto = new UpdateMonedaDto
            {
                Id = 1,
                Codigo = "USD",
                Nombre = "Dólar Actualizado",
                Simbolo = "$",
                TasaCambio = 1.05m,
                EsPredeterminada = true,
                Activa = true
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
            var updateDto = new UpdateMonedaDto
            {
                Id = 2,
                Codigo = "USD",
                Nombre = "Dólar Actualizado",
                Simbolo = "$",
                TasaCambio = 1.05m,
                EsPredeterminada = true,
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
            var updateDto = new UpdateMonedaDto
            {
                Id = 999,
                Codigo = "XXX",
                Nombre = "Moneda Inexistente",
                Simbolo = "X",
                TasaCambio = 1,
                EsPredeterminada = false,
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


