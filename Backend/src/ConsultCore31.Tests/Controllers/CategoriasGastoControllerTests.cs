using ConsultCore31.Application.DTOs.CategoriaGasto;
using ConsultCore31.Application.Interfaces;
using ConsultCore31.WebAPI.Controllers.V1;

using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

using Moq;

namespace ConsultCore31.Tests.Controllers
{
    /// <summary>
    /// Pruebas para el controlador de categorías de gasto
    /// </summary>
    public class CategoriasGastoControllerTests
    {
        private readonly Mock<ICategoriaGastoService> _mockService;
        private readonly Mock<ILogger<CategoriasGastoController>> _mockLogger;
        private readonly CategoriasGastoController _controller;

        public CategoriasGastoControllerTests()
        {
            _mockService = new Mock<ICategoriaGastoService>();
            _mockLogger = new Mock<ILogger<CategoriasGastoController>>();
            _controller = new CategoriasGastoController(_mockService.Object, _mockLogger.Object);
        }

        [Fact]
        public async Task GetAll_DebeRetornarOkConListaDeCategorias()
        {
            // Arrange
            var categorias = new List<CategoriaGastoDto>
            {
                new CategoriaGastoDto { Id = 1, Nombre = "Transporte", Descripcion = "Gastos de transporte", FechaCreacion = DateTime.UtcNow },
                new CategoriaGastoDto { Id = 2, Nombre = "Alimentación", Descripcion = "Gastos de alimentación", FechaCreacion = DateTime.UtcNow }
            };

            _mockService.Setup(service => service.GetAllAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(categorias);

            // Act
            var result = await _controller.GetAll();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsAssignableFrom<IEnumerable<CategoriaGastoDto>>(okResult.Value);
            Assert.Equal(2, ((List<CategoriaGastoDto>)returnValue).Count);
        }

        [Fact]
        public async Task GetById_ConIdExistente_DebeRetornarOkConCategoria()
        {
            // Arrange
            var categoria = new CategoriaGastoDto
            {
                Id = 1,
                Nombre = "Transporte",
                Descripcion = "Gastos de transporte",
                FechaCreacion = DateTime.UtcNow
            };

            _mockService.Setup(service => service.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(categoria);

            // Act
            var result = await _controller.GetById(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsType<CategoriaGastoDto>(okResult.Value);
            Assert.Equal(1, returnValue.Id);
            Assert.Equal("Transporte", returnValue.Nombre);
        }

        [Fact]
        public async Task GetById_ConIdInexistente_DebeRetornarNotFound()
        {
            // Arrange
            _mockService.Setup(service => service.GetByIdAsync(999, It.IsAny<CancellationToken>()))
                .ReturnsAsync((CategoriaGastoDto)null);

            // Act
            var result = await _controller.GetById(999);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task Create_ConDatosValidos_DebeRetornarCreatedAtAction()
        {
            // Arrange
            var createDto = new CreateCategoriaGastoDto
            {
                Nombre = "Nueva Categoría",
                Descripcion = "Descripción de la nueva categoría",
                EsEstandar = true,
                RequiereComprobante = true,
                Activa = true
            };

            var createdDto = new CategoriaGastoDto
            {
                Id = 1,
                Nombre = "Nueva Categoría",
                Descripcion = "Descripción de la nueva categoría",
                EsEstandar = true,
                RequiereComprobante = true,
                Activa = true,
                FechaCreacion = DateTime.UtcNow
            };

            _mockService.Setup(service => service.CreateAsync(createDto, It.IsAny<CancellationToken>()))
                .ReturnsAsync(createdDto);

            // Act
            var result = await _controller.Create(createDto);

            // Assert
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result);
            Assert.Equal(nameof(CategoriasGastoController.GetById), createdAtActionResult.ActionName);
            Assert.Equal(1, createdAtActionResult.RouteValues["id"]);
            var returnValue = Assert.IsType<CategoriaGastoDto>(createdAtActionResult.Value);
            Assert.Equal(1, returnValue.Id);
            Assert.Equal("Nueva Categoría", returnValue.Nombre);
        }

        [Fact]
        public async Task Update_ConIdYDtoValidos_DebeRetornarNoContent()
        {
            // Arrange
            var updateDto = new UpdateCategoriaGastoDto
            {
                Id = 1,
                Nombre = "Categoría Actualizada",
                Descripcion = "Descripción actualizada",
                EsEstandar = false,
                RequiereComprobante = false,
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
            var updateDto = new UpdateCategoriaGastoDto
            {
                Id = 2,
                Nombre = "Categoría Actualizada",
                Descripcion = "Descripción actualizada",
                EsEstandar = false,
                RequiereComprobante = false,
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
            var updateDto = new UpdateCategoriaGastoDto
            {
                Id = 999,
                Nombre = "Categoría Actualizada",
                Descripcion = "Descripción actualizada",
                EsEstandar = false,
                RequiereComprobante = false,
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