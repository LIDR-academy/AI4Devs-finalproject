using AutoMapper;

using ConsultCore31.Application.DTOs.EstadoAprobacion;
using ConsultCore31.Application.Mappings;
using ConsultCore31.Application.Services;
using ConsultCore31.Core.Entities;
using ConsultCore31.Core.Interfaces;

using Microsoft.Extensions.Logging;

using Moq;

namespace ConsultCore31.Tests.Services
{
    /// <summary>
    /// Pruebas unitarias para el servicio de estados de aprobación
    /// </summary>
    public class EstadoAprobacionServiceTests
    {
        private readonly Mock<IGenericRepository<EstadoAprobacion, int>> _mockRepository;
        private readonly Mock<ILogger<EstadoAprobacionService>> _mockLogger;
        private readonly IMapper _mapper;
        private readonly EstadoAprobacionService _service;

        public EstadoAprobacionServiceTests()
        {
            _mockRepository = new Mock<IGenericRepository<EstadoAprobacion, int>>();
            _mockLogger = new Mock<ILogger<EstadoAprobacionService>>();

            // Configurar AutoMapper
            var mapperConfig = new MapperConfiguration(cfg =>
            {
                cfg.AddProfile<EstadoAprobacionProfile>();
            });
            _mapper = mapperConfig.CreateMapper();

            // Crear el servicio con las dependencias mockeadas
            _service = new EstadoAprobacionService(_mockRepository.Object, _mapper, _mockLogger.Object);
        }

        [Fact]
        public async Task GetAllAsync_DebeRetornarTodosLosEstados()
        {
            // Arrange
            var estados = new List<EstadoAprobacion>
            {
                new EstadoAprobacion { Id = 1, Nombre = "Pendiente", Descripcion = "Pendiente de aprobación", FechaCreacion = DateTime.UtcNow },
                new EstadoAprobacion { Id = 2, Nombre = "Aprobado", Descripcion = "Aprobado por el supervisor", FechaCreacion = DateTime.UtcNow }
            };

            _mockRepository.Setup(repo => repo.GetAllActiveAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(estados);

            // Act
            var result = await _service.GetAllAsync();

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count());
            Assert.Contains(result, dto => dto.Nombre == "Pendiente");
            Assert.Contains(result, dto => dto.Nombre == "Aprobado");
        }

        [Fact]
        public async Task GetByIdAsync_ConIdExistente_DebeRetornarEstado()
        {
            // Arrange
            var estado = new EstadoAprobacion
            {
                Id = 1,
                Nombre = "Pendiente",
                Descripcion = "Pendiente de aprobación",
                FechaCreacion = DateTime.UtcNow
            };

            _mockRepository.Setup(repo => repo.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(estado);

            // Act
            var result = await _service.GetByIdAsync(1, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(1, result.Id);
            Assert.Equal("Pendiente", result.Nombre);
            Assert.Equal("Pendiente de aprobación", result.Descripcion);
        }

        [Fact]
        public async Task GetByIdAsync_ConIdInexistente_DebeRetornarNull()
        {
            // Arrange
            _mockRepository.Setup(repo => repo.GetByIdAsync(999, It.IsAny<CancellationToken>()))
                .ReturnsAsync((EstadoAprobacion)null);

            // Act
            var result = await _service.GetByIdAsync(999, CancellationToken.None);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task CreateAsync_DebeCrearYRetornarEstado()
        {
            // Arrange
            var createDto = new CreateEstadoAprobacionDto
            {
                Nombre = "Rechazado",
                Descripcion = "Rechazado por el supervisor"
            };

            var newEntity = new EstadoAprobacion
            {
                Id = 3,
                Nombre = "Rechazado",
                Descripcion = "Rechazado por el supervisor",
                Activo = true,
                FechaCreacion = DateTime.UtcNow
            };

            _mockRepository.Setup(repo => repo.AddAsync(It.IsAny<EstadoAprobacion>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(newEntity);

            // Act
            var result = await _service.CreateAsync(createDto, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(3, result.Id);
            Assert.Equal("Rechazado", result.Nombre);
            Assert.Equal("Rechazado por el supervisor", result.Descripcion);
            _mockRepository.Verify(repo => repo.AddAsync(It.Is<EstadoAprobacion>(t =>
                t.Nombre == "Rechazado" &&
                t.Descripcion == "Rechazado por el supervisor" &&
                t.Activo), It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task UpdateAsync_ConIdExistente_DebeActualizarYRetornarTrue()
        {
            // Arrange
            var updateDto = new UpdateEstadoAprobacionDto
            {
                Id = 1,
                Nombre = "Pendiente Actualizado",
                Descripcion = "Descripción actualizada",
                Activo = true
            };

            var existingEntity = new EstadoAprobacion
            {
                Id = 1,
                Nombre = "Pendiente",
                Descripcion = "Pendiente de aprobación",
                Activo = true,
                FechaCreacion = DateTime.UtcNow
            };

            _mockRepository.Setup(repo => repo.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(existingEntity);

            // Act
            var result = await _service.UpdateAsync(updateDto, CancellationToken.None);

            // Assert
            Assert.True(result);
            _mockRepository.Verify(repo => repo.UpdateAsync(It.Is<EstadoAprobacion>(t =>
                t.Id == 1 &&
                t.Nombre == "Pendiente Actualizado" &&
                t.Descripcion == "Descripción actualizada" &&
                t.Activo), It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task UpdateAsync_ConIdInexistente_DebeRetornarFalse()
        {
            // Arrange
            var updateDto = new UpdateEstadoAprobacionDto
            {
                Id = 999,
                Nombre = "Estado Inexistente",
                Descripcion = "Descripción inexistente",
                Activo = true
            };

            _mockRepository.Setup(repo => repo.GetByIdAsync(999, It.IsAny<CancellationToken>()))
                .ReturnsAsync((EstadoAprobacion)null);

            // Act
            var result = await _service.UpdateAsync(updateDto, CancellationToken.None);

            // Assert
            Assert.False(result);
            _mockRepository.Verify(repo => repo.UpdateAsync(It.IsAny<EstadoAprobacion>(), It.IsAny<CancellationToken>()), Times.Never);
        }

        [Fact]
        public async Task DeleteAsync_ConIdExistente_DebeEliminarYRetornarTrue()
        {
            // Arrange
            _mockRepository.Setup(repo => repo.SoftDeleteAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            // Act
            var result = await _service.DeleteAsync(1, CancellationToken.None);

            // Assert
            Assert.True(result);
            _mockRepository.Verify(repo => repo.SoftDeleteAsync(1, It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task DeleteAsync_ConIdInexistente_DebeRetornarFalse()
        {
            // Arrange
            _mockRepository.Setup(repo => repo.SoftDeleteAsync(999, It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);

            // Act
            var result = await _service.DeleteAsync(999, CancellationToken.None);

            // Assert
            Assert.False(result);
            _mockRepository.Verify(repo => repo.SoftDeleteAsync(999, It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task ExistsAsync_ConIdExistente_DebeRetornarTrue()
        {
            // Arrange
            _mockRepository.Setup(repo => repo.ExistsAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            // Act
            var result = await _service.ExistsAsync(1, CancellationToken.None);

            // Assert
            Assert.True(result);
        }

        [Fact]
        public async Task ExistsAsync_ConIdInexistente_DebeRetornarFalse()
        {
            // Arrange
            _mockRepository.Setup(repo => repo.ExistsAsync(999, It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);

            // Act
            var result = await _service.ExistsAsync(999, CancellationToken.None);

            // Assert
            Assert.False(result);
        }
    }
}