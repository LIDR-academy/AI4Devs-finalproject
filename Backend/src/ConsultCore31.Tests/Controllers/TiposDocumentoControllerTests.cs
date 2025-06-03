using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using ConsultCore31.Application.DTOs.TipoDocumento;
using ConsultCore31.Application.Interfaces;
using ConsultCore31.WebAPI.Controllers.V1;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace ConsultCore31.Tests.Controllers
{
    /// <summary>
    /// Pruebas para el controlador de tipos de documento
    /// </summary>
    public class TiposDocumentoControllerTests
    {
        private readonly Mock<ITipoDocumentoService> _mockService;
        private readonly Mock<ILogger<TiposDocumentoController>> _mockLogger;
        private readonly TiposDocumentoController _controller;

        public TiposDocumentoControllerTests()
        {
            _mockService = new Mock<ITipoDocumentoService>();
            _mockLogger = new Mock<ILogger<TiposDocumentoController>>();
            _controller = new TiposDocumentoController(_mockService.Object, _mockLogger.Object);
        }

        [Fact]
        public async Task GetAll_DebeRetornarOkConListaDeTipos()
        {
            // Arrange
            var tipos = new List<TipoDocumentoDto>
            {
                new TipoDocumentoDto { Id = 1, Nombre = "Informe", Descripcion = "Informe técnico", FechaCreacion = DateTime.UtcNow },
                new TipoDocumentoDto { Id = 2, Nombre = "Contrato", Descripcion = "Documento contractual", FechaCreacion = DateTime.UtcNow }
            };

            _mockService.Setup(service => service.GetAllAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(tipos);

            // Act
            var result = await _controller.GetAll();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsAssignableFrom<IEnumerable<TipoDocumentoDto>>(okResult.Value);
            Assert.Equal(2, ((List<TipoDocumentoDto>)returnValue).Count);
        }

        [Fact]
        public async Task GetById_ConIdExistente_DebeRetornarOkConTipo()
        {
            // Arrange
            var tipo = new TipoDocumentoDto
            {
                Id = 1,
                Nombre = "Informe",
                Descripcion = "Informe técnico",
                FechaCreacion = DateTime.UtcNow
            };

            _mockService.Setup(service => service.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(tipo);

            // Act
            var result = await _controller.GetById(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsType<TipoDocumentoDto>(okResult.Value);
            Assert.Equal(1, returnValue.Id);
            Assert.Equal("Informe", returnValue.Nombre);
        }

        [Fact]
        public async Task GetById_ConIdInexistente_DebeRetornarNotFound()
        {
            // Arrange
            _mockService.Setup(service => service.GetByIdAsync(999, It.IsAny<CancellationToken>()))
                .ReturnsAsync((TipoDocumentoDto)null);

            // Act
            var result = await _controller.GetById(999);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task Create_ConDatosValidos_DebeRetornarCreatedAtAction()
        {
            // Arrange
            var createDto = new CreateTipoDocumentoDto
            {
                Nombre = "Factura",
                Descripcion = "Documento de facturación",
                Activo = true
            };

            var createdDto = new TipoDocumentoDto
            {
                Id = 3,
                Nombre = "Factura",
                Descripcion = "Documento de facturación",
                Activo = true,
                FechaCreacion = DateTime.UtcNow
            };

            _mockService.Setup(service => service.CreateAsync(createDto, It.IsAny<CancellationToken>()))
                .ReturnsAsync(createdDto);

            // Act
            var result = await _controller.Create(createDto);

            // Assert
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result);
            Assert.Equal(nameof(TiposDocumentoController.GetById), createdAtActionResult.ActionName);
            Assert.Equal(3, createdAtActionResult.RouteValues["id"]);
            var returnValue = Assert.IsType<TipoDocumentoDto>(createdAtActionResult.Value);
            Assert.Equal(3, returnValue.Id);
            Assert.Equal("Factura", returnValue.Nombre);
        }

        [Fact]
        public async Task Update_ConIdYDtoValidos_DebeRetornarNoContent()
        {
            // Arrange
            var updateDto = new UpdateTipoDocumentoDto
            {
                Id = 1,
                Nombre = "Informe Actualizado",
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
            var updateDto = new UpdateTipoDocumentoDto
            {
                Id = 2,
                Nombre = "Informe Actualizado",
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
            var updateDto = new UpdateTipoDocumentoDto
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


