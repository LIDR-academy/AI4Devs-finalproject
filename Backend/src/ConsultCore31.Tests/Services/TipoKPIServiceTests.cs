using AutoMapper;

using ConsultCore31.Application.DTOs.TipoKPI;
using ConsultCore31.Application.Mappings;
using ConsultCore31.Application.Services;
using ConsultCore31.Core.Entities;
using ConsultCore31.Core.Interfaces;

using Microsoft.Extensions.Logging;

using Moq;

namespace ConsultCore31.Tests.Services
{
    /// <summary>
    /// Pruebas unitarias para el servicio de tipos de KPI
    /// </summary>
    public class TipoKPIServiceTests
    {
        private readonly IMapper _mapper;
        private readonly Mock<ILogger<TipoKPIService>> _mockLogger;
        private readonly Mock<IGenericRepository<TipoKPI, int>> _mockRepository;
        private readonly TipoKPIService _service;

        public TipoKPIServiceTests()
        {
            _mockRepository = new Mock<IGenericRepository<TipoKPI, int>>();
            _mockLogger = new Mock<ILogger<TipoKPIService>>();

            // Configurar AutoMapper
            var mapperConfig = new MapperConfiguration(cfg =>
            {
                cfg.AddProfile<TipoKPIProfile>();
            });
            _mapper = mapperConfig.CreateMapper();

            // Crear el servicio con las dependencias mockeadas
            _service = new TipoKPIService(_mockRepository.Object, _mapper, _mockLogger.Object);
        }

        [Fact]
        public async Task CreateAsync_DebeCrearYRetornarTipo()
        {
            // Arrange
            var createDto = new CreateTipoKPIDto
            {
                Nombre = "Estratégico",
                Descripcion = "Indicadores estratégicos"
            };

            var newEntity = new TipoKPI
            {
                Id = 3,
                Nombre = "Estratégico",
                Descripcion = "Indicadores estratégicos",
                Activo = true,
                FechaCreacion = DateTime.UtcNow
            };

            _mockRepository.Setup(repo => repo.AddAsync(It.IsAny<TipoKPI>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(newEntity);

            // Act
            var result = await _service.CreateAsync(createDto, CancellationToken.None).ConfigureAwait(true);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(3, result.Id);
            Assert.Equal("Estratégico", result.Nombre);
            Assert.Equal("Indicadores estratégicos", result.Descripcion);
            _mockRepository.Verify(repo => repo.AddAsync(It.Is<TipoKPI>(t =>
                t.Nombre == "Estratégico" &&
                t.Descripcion == "Indicadores estratégicos" &&
                t.Activo), It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task DeleteAsync_ConIdExistente_DebeEliminarYRetornarTrue()
        {
            // Arrange
            _mockRepository.Setup(repo => repo.SoftDeleteAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            // Act
            var result = await _service.DeleteAsync(1, CancellationToken.None).ConfigureAwait(true);

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
            var result = await _service.DeleteAsync(999, CancellationToken.None).ConfigureAwait(true);

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
            var result = await _service.ExistsAsync(1, CancellationToken.None).ConfigureAwait(true);

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

        [Fact]
        public async Task GetAllAsync_DebeRetornarTodosLosTipos()
        {
            // Arrange
            var tipos = new List<TipoKPI>
            {
                new TipoKPI { Id = 1, Nombre = "Financiero", Descripcion = "Indicadores financieros", FechaCreacion = DateTime.UtcNow },
                new TipoKPI { Id = 2, Nombre = "Operativo", Descripcion = "Indicadores operativos", FechaCreacion = DateTime.UtcNow }
            };

            _mockRepository.Setup(repo => repo.GetAllActiveAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(tipos);

            // Act
            var result = await _service.GetAllAsync();

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count());
            Assert.Contains(result, dto => dto.Nombre == "Financiero");
            Assert.Contains(result, dto => dto.Nombre == "Operativo");
        }

        [Fact]
        public async Task GetByIdAsync_ConIdExistente_DebeRetornarTipo()
        {
            // Arrange
            var tipo = new TipoKPI
            {
                Id = 1,
                Nombre = "Financiero",
                Descripcion = "Indicadores financieros",
                FechaCreacion = DateTime.UtcNow
            };

            _mockRepository.Setup(repo => repo.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(tipo);

            // Act
            var result = await _service.GetByIdAsync(1, CancellationToken.None).ConfigureAwait(true);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(1, result.Id);
            Assert.Equal("Financiero", result.Nombre);
            Assert.Equal("Indicadores financieros", result.Descripcion);
        }

        [Fact]
        public async Task GetByIdAsync_ConIdInexistente_DebeRetornarNull()
        {
            // Arrange
            _mockRepository.Setup(repo => repo.GetByIdAsync(999, It.IsAny<CancellationToken>()))
                .ReturnsAsync((TipoKPI)null);

            // Act
            var result = await _service.GetByIdAsync(999, CancellationToken.None).ConfigureAwait(true);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task UpdateAsync_ConIdExistente_DebeActualizarYRetornarTrue()
        {
            // Arrange
            var updateDto = new UpdateTipoKPIDto
            {
                Id = 1,
                Nombre = "Financiero Actualizado",
                Descripcion = "Descripción actualizada",
                Activo = true
            };

            var existingEntity = new TipoKPI
            {
                Id = 1,
                Nombre = "Financiero",
                Descripcion = "Indicadores financieros",
                Activo = true,
                FechaCreacion = DateTime.UtcNow
            };

            _mockRepository.Setup(repo => repo.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(existingEntity);

            // Act
            var result = await _service.UpdateAsync(updateDto, CancellationToken.None).ConfigureAwait(true);

            // Assert
            Assert.True(result);
            _mockRepository.Verify(repo => repo.UpdateAsync(It.Is<TipoKPI>(t =>
                t.Id == 1 &&
                t.Nombre == "Financiero Actualizado" &&
                t.Descripcion == "Descripción actualizada" &&
                t.Activo), It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task UpdateAsync_ConIdInexistente_DebeRetornarFalse()
        {
            // Arrange
            var updateDto = new UpdateTipoKPIDto
            {
                Id = 999,
                Nombre = "Tipo Inexistente",
                Descripcion = "Descripción inexistente",
                Activo = true
            };

            _mockRepository.Setup(repo => repo.GetByIdAsync(999, It.IsAny<CancellationToken>()))
                .ReturnsAsync((TipoKPI)null);

            // Act
            var result = await _service.UpdateAsync(updateDto, CancellationToken.None).ConfigureAwait(true);

            // Assert
            Assert.False(result);
            _mockRepository.Verify(repo => repo.UpdateAsync(It.IsAny<TipoKPI>(), It.IsAny<CancellationToken>()), Times.Never);
        }
    }
}