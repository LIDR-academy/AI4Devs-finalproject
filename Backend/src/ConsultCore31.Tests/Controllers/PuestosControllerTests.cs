using ConsultCore31.Application.DTOs.Puesto;
using ConsultCore31.Application.Interfaces;
using ConsultCore31.WebAPI.Controllers.V1;

using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

using Moq;

namespace ConsultCore31.Tests.Controllers
{
    /// <summary>
    /// Pruebas para el controlador de puestos
    /// </summary>
    public class PuestosControllerTests
    {
        private readonly Mock<IPuestoService> _mockService;
        private readonly Mock<ILogger<PuestosController>> _mockLogger;
        private readonly PuestosController _controller;

        public PuestosControllerTests()
        {
            _mockService = new Mock<IPuestoService>();
            _mockLogger = new Mock<ILogger<PuestosController>>();
            _controller = new PuestosController(_mockService.Object, _mockLogger.Object);
        }

        [Fact]
        public async Task GetAll_DebeRetornarOkConListaDePuestos()
        {
            // Arrange
            var puestos = new List<PuestoDto>
            {
                new PuestoDto { Id = 1, Nombre = "Gerente", Descripcion = "Gerente de departamento", FechaCreacion = DateTime.UtcNow },
                new PuestoDto { Id = 2, Nombre = "Analista", Descripcion = "Analista de sistemas", FechaCreacion = DateTime.UtcNow }
            };

            _mockService.Setup(service => service.GetAllAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(puestos);

            // Act
            var result = await _controller.GetAll();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsAssignableFrom<IEnumerable<PuestoDto>>(okResult.Value);
            Assert.Equal(2, ((List<PuestoDto>)returnValue).Count);
        }

        [Fact]
        public async Task GetById_ConIdExistente_DebeRetornarOkConPuesto()
        {
            // Arrange
            var puesto = new PuestoDto
            {
                Id = 1,
                Nombre = "Gerente",
                Descripcion = "Gerente de departamento",

                FechaCreacion = DateTime.UtcNow
            };

            _mockService.Setup(service => service.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(puesto);

            // Act
            var result = await _controller.GetById(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsType<PuestoDto>(okResult.Value);
            Assert.Equal(1, returnValue.Id);
            Assert.Equal("Gerente", returnValue.Nombre);
        }

        [Fact]
        public async Task GetById_ConIdInexistente_DebeRetornarNotFound()
        {
            // Arrange
            _mockService.Setup(service => service.GetByIdAsync(999, It.IsAny<CancellationToken>()))
                .ReturnsAsync((PuestoDto)null);

            // Act
            var result = await _controller.GetById(999);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task Create_ConDatosValidos_DebeRetornarCreatedAtAction()
        {
            // Arrange
            var createDto = new CreatePuestoDto
            {
                Nombre = "Desarrollador",
                Descripcion = "Desarrollador de software",

                Activo = true
            };

            var createdDto = new PuestoDto
            {
                Id = 3,
                Nombre = "Desarrollador",
                Descripcion = "Desarrollador de software",

                Activo = true,
                FechaCreacion = DateTime.UtcNow
            };

            _mockService.Setup(service => service.CreateAsync(createDto, It.IsAny<CancellationToken>()))
                .ReturnsAsync(createdDto);

            // Act
            var result = await _controller.Create(createDto);

            // Assert
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result);
            Assert.Equal(nameof(PuestosController.GetById), createdAtActionResult.ActionName);
            Assert.Equal(3, createdAtActionResult.RouteValues["id"]);
            var returnValue = Assert.IsType<PuestoDto>(createdAtActionResult.Value);
            Assert.Equal(3, returnValue.Id);
            Assert.Equal("Desarrollador", returnValue.Nombre);
        }

        [Fact]
        public async Task Update_ConIdYDtoValidos_DebeRetornarNoContent()
        {
            // Arrange
            var updateDto = new UpdatePuestoDto
            {
                Id = 1,
                Nombre = "Gerente Senior",
                Descripcion = "Gerente senior de departamento",

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
            var updateDto = new UpdatePuestoDto
            {
                Id = 2,
                Nombre = "Gerente Senior",
                Descripcion = "Gerente senior de departamento",

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
            var updateDto = new UpdatePuestoDto
            {
                Id = 999,
                Nombre = "Puesto Inexistente",
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