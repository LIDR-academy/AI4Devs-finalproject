using AutoMapper;

using ConsultCore31.Application.DTOs.Moneda;
using ConsultCore31.Application.Mappings;
using ConsultCore31.Application.Services;
using ConsultCore31.Core.Entities;
using ConsultCore31.Core.Interfaces;

using Microsoft.Extensions.Logging;

using Moq;

namespace ConsultCore31.Tests.Services
{
    /// <summary>
    /// Pruebas unitarias para el servicio de monedas
    /// </summary>
    public class MonedaServiceTests
    {
        private readonly Mock<IGenericRepository<Moneda, int>> _mockRepository;
        private readonly Mock<ILogger<MonedaService>> _mockLogger;
        private readonly IMapper _mapper;
        private readonly MonedaService _service;

        public MonedaServiceTests()
        {
            _mockRepository = new Mock<IGenericRepository<Moneda, int>>();
            _mockLogger = new Mock<ILogger<MonedaService>>();

            // Configurar AutoMapper
            var mapperConfig = new MapperConfiguration(cfg =>
            {
                cfg.AddProfile<MonedaProfile>();
            });
            _mapper = mapperConfig.CreateMapper();

            // Crear el servicio con las dependencias mockeadas
            _service = new MonedaService(_mockRepository.Object, _mapper, _mockLogger.Object);
        }

        [Fact]
        public async Task GetAllAsync_DebeRetornarTodasLasMonedas()
        {
            // Arrange
            var monedas = new List<Moneda>
            {
                new Moneda { Id = 1, Codigo = "USD", Nombre = "Dólar Estadounidense", Simbolo = "$", TasaCambio = 1, FechaCreacion = DateTime.UtcNow },
                new Moneda { Id = 2, Codigo = "EUR", Nombre = "Euro", Simbolo = "€", TasaCambio = 0.85m, FechaCreacion = DateTime.UtcNow }
            };

            _mockRepository.Setup(repo => repo.GetAllActiveAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(monedas);

            // Act
            var result = await _service.GetAllAsync(CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count());
            Assert.Contains(result, dto => dto.Codigo == "USD");
            Assert.Contains(result, dto => dto.Codigo == "EUR");
        }

        [Fact]
        public async Task GetByIdAsync_ConIdExistente_DebeRetornarMoneda()
        {
            // Arrange
            var moneda = new Moneda
            {
                Id = 1,
                Codigo = "USD",
                Nombre = "Dólar Estadounidense",
                Simbolo = "$",
                TasaCambio = 1,
                FechaCreacion = DateTime.UtcNow
            };

            _mockRepository.Setup(repo => repo.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(moneda);

            // Act
            var result = await _service.GetByIdAsync(1, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(1, result.Id);
            Assert.Equal("USD", result.Codigo);
            Assert.Equal("Dólar Estadounidense", result.Nombre);
        }

        [Fact]
        public async Task GetByIdAsync_ConIdInexistente_DebeRetornarNull()
        {
            // Arrange
            _mockRepository.Setup(repo => repo.GetByIdAsync(999, It.IsAny<CancellationToken>()))
                .ReturnsAsync((Moneda)null);

            // Act
            var result = await _service.GetByIdAsync(999, CancellationToken.None);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task CreateAsync_DebeCrearYRetornarMoneda()
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

            Moneda savedEntity = null;

            _mockRepository.Setup(repo => repo.AddAsync(It.IsAny<Moneda>(), It.IsAny<CancellationToken>()))
                .Callback<Moneda, CancellationToken>((entity, token) =>
                {
                    entity.Id = 3;
                    entity.FechaCreacion = DateTime.UtcNow;
                    savedEntity = entity;
                })
                .ReturnsAsync((Moneda entity, CancellationToken token) => entity);

            // Act
            var result = await _service.CreateAsync(createDto, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(3, result.Id);
            Assert.Equal("MXN", result.Codigo);
            Assert.Equal("Peso Mexicano", result.Nombre);
            Assert.Equal("$", result.Simbolo);
            Assert.Equal(20.5m, result.TasaCambio);
            Assert.False(result.EsPredeterminada);
            Assert.True(result.Activa);

            _mockRepository.Verify(repo => repo.AddAsync(It.IsAny<Moneda>(), It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task UpdateAsync_ConIdExistente_DebeActualizarYRetornarTrue()
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

            var existingEntity = new Moneda
            {
                Id = 1,
                Codigo = "USD",
                Nombre = "Dólar Estadounidense",
                Simbolo = "$",
                TasaCambio = 1,
                EsPredeterminada = false,
                Activa = true,
                FechaCreacion = DateTime.UtcNow
            };

            _mockRepository.Setup(repo => repo.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(existingEntity);

            // Act
            var result = await _service.UpdateAsync(updateDto, CancellationToken.None);

            // Assert
            Assert.True(result);
            _mockRepository.Verify(repo => repo.UpdateAsync(It.Is<Moneda>(m =>
                m.Id == 1 &&
                m.Codigo == "USD" &&
                m.Nombre == "Dólar Actualizado" &&
                m.TasaCambio == 1.05m &&
                m.EsPredeterminada &&
                m.Activa), It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task UpdateAsync_ConIdInexistente_DebeRetornarFalse()
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

            _mockRepository.Setup(repo => repo.GetByIdAsync(999, It.IsAny<CancellationToken>()))
                .ReturnsAsync((Moneda)null);

            // Act
            var result = await _service.UpdateAsync(updateDto, CancellationToken.None);

            // Assert
            Assert.False(result);
            _mockRepository.Verify(repo => repo.UpdateAsync(It.IsAny<Moneda>(), It.IsAny<CancellationToken>()), Times.Never);
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