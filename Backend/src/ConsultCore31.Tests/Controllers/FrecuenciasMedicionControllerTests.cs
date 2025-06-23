using ConsultCore31.Application.DTOs.FrecuenciaMedicion;
using ConsultCore31.Application.Interfaces;
using ConsultCore31.WebAPI.Controllers.V1;

using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

using Moq;

namespace ConsultCore31.Tests.Controllers
{
    /// <summary>
    /// Pruebas para el controlador de frecuencias de medición
    /// </summary>
    public class FrecuenciasMedicionControllerTests
    {
        private readonly Mock<IFrecuenciaMedicionService> _mockService;
        private readonly Mock<ILogger<FrecuenciasMedicionController>> _mockLogger;
        private readonly FrecuenciasMedicionController _controller;

        public FrecuenciasMedicionControllerTests()
        {
            _mockService = new Mock<IFrecuenciaMedicionService>();
            _mockLogger = new Mock<ILogger<FrecuenciasMedicionController>>();
            _controller = new FrecuenciasMedicionController(_mockService.Object, _mockLogger.Object);
        }

        [Fact]
        public async Task GetAll_DebeRetornarOkConListaDeFrecuencias()
        {
            // Arrange
            var frecuencias = new List<FrecuenciaMedicionDto>
            {
                new FrecuenciaMedicionDto { Id = 1, Nombre = "Diaria", Descripcion = "Medición diaria", FechaCreacion = DateTime.UtcNow },
                new FrecuenciaMedicionDto { Id = 2, Nombre = "Semanal", Descripcion = "Medición semanal", FechaCreacion = DateTime.UtcNow }
            };

            _mockService.Setup(service => service.GetAllAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(frecuencias);

            // Act
            var result = await _controller.GetAll();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsAssignableFrom<IEnumerable<FrecuenciaMedicionDto>>(okResult.Value);
            Assert.Equal(2, ((List<FrecuenciaMedicionDto>)returnValue).Count);
        }

        [Fact]
        public async Task GetById_ConIdExistente_DebeRetornarOkConFrecuencia()
        {
            // Arrange
            var frecuencia = new FrecuenciaMedicionDto
            {
                Id = 1,
                Nombre = "Diaria",
                Descripcion = "Medición diaria",
                FechaCreacion = DateTime.UtcNow
            };

            _mockService.Setup(service => service.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(frecuencia);

            // Act
            var result = await _controller.GetById(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsType<FrecuenciaMedicionDto>(okResult.Value);
            Assert.Equal(1, returnValue.Id);
            Assert.Equal("Diaria", returnValue.Nombre);
        }

        [Fact]
        public async Task GetById_ConIdInexistente_DebeRetornarNotFound()
        {
            // Arrange
            _mockService.Setup(service => service.GetByIdAsync(999, It.IsAny<CancellationToken>()))
                .ReturnsAsync((FrecuenciaMedicionDto)null);

            // Act
            var result = await _controller.GetById(999);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task Create_ConDatosValidos_DebeRetornarCreatedAtAction()
        {
            // Arrange
            var createDto = new CreateFrecuenciaMedicionDto
            {
                Nombre = "Mensual",
                Descripcion = "Medición mensual",
                Activa = true
            };

            var createdDto = new FrecuenciaMedicionDto
            {
                Id = 3,
                Nombre = "Mensual",
                Descripcion = "Medición mensual",
                Activa = true,
                FechaCreacion = DateTime.UtcNow
            };

            _mockService.Setup(service => service.CreateAsync(createDto, It.IsAny<CancellationToken>()))
                .ReturnsAsync(createdDto);

            // Act
            var result = await _controller.Create(createDto);

            // Assert
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result);
            Assert.Equal(nameof(FrecuenciasMedicionController.GetById), createdAtActionResult.ActionName);
            Assert.Equal(3, createdAtActionResult.RouteValues["id"]);
            var returnValue = Assert.IsType<FrecuenciaMedicionDto>(createdAtActionResult.Value);
            Assert.Equal(3, returnValue.Id);
            Assert.Equal("Mensual", returnValue.Nombre);
        }

        [Fact]
        public async Task Update_ConIdYDtoValidos_DebeRetornarNoContent()
        {
            // Arrange
            var updateDto = new UpdateFrecuenciaMedicionDto
            {
                Id = 1,
                Nombre = "Diaria Actualizada",
                Descripcion = "Descripción actualizada",
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
            var updateDto = new UpdateFrecuenciaMedicionDto
            {
                Id = 2,
                Nombre = "Diaria Actualizada",
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
            var updateDto = new UpdateFrecuenciaMedicionDto
            {
                Id = 999,
                Nombre = "Frecuencia Inexistente",
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