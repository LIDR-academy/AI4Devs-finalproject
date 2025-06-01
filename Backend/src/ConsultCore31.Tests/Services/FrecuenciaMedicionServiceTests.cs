using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using ConsultCore31.Application.DTOs.FrecuenciaMedicion;
using ConsultCore31.Application.Mappings;
using ConsultCore31.Application.Services;
using ConsultCore31.Core.Entities;
using ConsultCore31.Core.Interfaces;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace ConsultCore31.Tests.Services
{
    /// <summary>
    /// Pruebas unitarias para el servicio de frecuencias de medición
    /// </summary>
    public class FrecuenciaMedicionServiceTests
    {
        private readonly Mock<IGenericRepository<FrecuenciaMedicion, int>> _mockRepository;
        private readonly Mock<ILogger<FrecuenciaMedicionService>> _mockLogger;
        private readonly IMapper _mapper;
        private readonly FrecuenciaMedicionService _service;

        public FrecuenciaMedicionServiceTests()
        {
            _mockRepository = new Mock<IGenericRepository<FrecuenciaMedicion, int>>();
            _mockLogger = new Mock<ILogger<FrecuenciaMedicionService>>();
            
            // Configurar AutoMapper
            var mapperConfig = new MapperConfiguration(cfg =>
            {
                cfg.AddProfile<FrecuenciaMedicionProfile>();
            });
            _mapper = mapperConfig.CreateMapper();
            
            // Crear el servicio con las dependencias mockeadas
            _service = new FrecuenciaMedicionService(_mockRepository.Object, _mapper, _mockLogger.Object);
        }

        [Fact]
        public async Task GetAllAsync_DebeRetornarTodasLasFrecuencias()
        {
            // Arrange
            var frecuencias = new List<FrecuenciaMedicion>
            {
                new FrecuenciaMedicion { Id = 1, Nombre = "Diaria", Descripcion = "Medición diaria", CreatedAt = DateTime.UtcNow },
                new FrecuenciaMedicion { Id = 2, Nombre = "Semanal", Descripcion = "Medición semanal", CreatedAt = DateTime.UtcNow }
            };

            _mockRepository.Setup(repo => repo.GetAllActiveAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(frecuencias);

            // Act
            var result = await _service.GetAllAsync();

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count());
            Assert.Contains(result, dto => dto.Nombre == "Diaria");
            Assert.Contains(result, dto => dto.Nombre == "Semanal");
        }

        [Fact]
        public async Task GetByIdAsync_ConIdExistente_DebeRetornarFrecuencia()
        {
            // Arrange
            var frecuencia = new FrecuenciaMedicion
            { 
                Id = 1, 
                Nombre = "Diaria", 
                Descripcion = "Medición diaria", 
                CreatedAt = DateTime.UtcNow 
            };

            _mockRepository.Setup(repo => repo.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(frecuencia);

            // Act
            var result = await _service.GetByIdAsync(1);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(1, result.Id);
            Assert.Equal("Diaria", result.Nombre);
            Assert.Equal("Medición diaria", result.Descripcion);
        }

        [Fact]
        public async Task GetByIdAsync_ConIdInexistente_DebeRetornarNull()
        {
            // Arrange
            _mockRepository.Setup(repo => repo.GetByIdAsync(999, It.IsAny<CancellationToken>()))
                .ReturnsAsync((FrecuenciaMedicion)null);

            // Act
            var result = await _service.GetByIdAsync(999);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task CreateAsync_DebeCrearYRetornarFrecuencia()
        {
            // Arrange
            var createDto = new CreateFrecuenciaMedicionDto
            {
                Nombre = "Mensual",
                Descripcion = "Medición mensual"
            };

            var newEntity = new FrecuenciaMedicion
            {
                Id = 3,
                Nombre = "Mensual",
                Descripcion = "Medición mensual",
                Activo = true,
                CreatedAt = DateTime.UtcNow
            };

            _mockRepository.Setup(repo => repo.AddAsync(It.IsAny<FrecuenciaMedicion>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(newEntity);

            // Act
            var result = await _service.CreateAsync(createDto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(3, result.Id);
            Assert.Equal("Mensual", result.Nombre);
            Assert.Equal("Medición mensual", result.Descripcion);
            _mockRepository.Verify(repo => repo.AddAsync(It.Is<FrecuenciaMedicion>(t => 
                t.Nombre == "Mensual" && 
                t.Descripcion == "Medición mensual" && 
                t.Activo), It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task UpdateAsync_ConIdExistente_DebeActualizarYRetornarTrue()
        {
            // Arrange
            var updateDto = new UpdateFrecuenciaMedicionDto
            {
                Id = 1,
                Nombre = "Diaria Actualizada",
                Descripcion = "Descripción actualizada",
                Activo = true
            };

            var existingEntity = new FrecuenciaMedicion
            {
                Id = 1,
                Nombre = "Diaria",
                Descripcion = "Medición diaria",
                Activo = true,
                CreatedAt = DateTime.UtcNow
            };

            _mockRepository.Setup(repo => repo.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(existingEntity);

            // Act
            var result = await _service.UpdateAsync(updateDto);

            // Assert
            Assert.True(result);
            _mockRepository.Verify(repo => repo.UpdateAsync(It.Is<FrecuenciaMedicion>(t => 
                t.Id == 1 && 
                t.Nombre == "Diaria Actualizada" && 
                t.Descripcion == "Descripción actualizada" && 
                t.Activo), It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task UpdateAsync_ConIdInexistente_DebeRetornarFalse()
        {
            // Arrange
            var updateDto = new UpdateFrecuenciaMedicionDto
            {
                Id = 999,
                Nombre = "Frecuencia Inexistente",
                Descripcion = "Descripción inexistente",
                Activo = true
            };

            _mockRepository.Setup(repo => repo.GetByIdAsync(999, It.IsAny<CancellationToken>()))
                .ReturnsAsync((FrecuenciaMedicion)null);

            // Act
            var result = await _service.UpdateAsync(updateDto);

            // Assert
            Assert.False(result);
            _mockRepository.Verify(repo => repo.UpdateAsync(It.IsAny<FrecuenciaMedicion>(), It.IsAny<CancellationToken>()), Times.Never);
        }

        [Fact]
        public async Task DeleteAsync_ConIdExistente_DebeEliminarYRetornarTrue()
        {
            // Arrange
            _mockRepository.Setup(repo => repo.SoftDeleteAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            // Act
            var result = await _service.DeleteAsync(1);

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
            var result = await _service.DeleteAsync(999);

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
            var result = await _service.ExistsAsync(1);

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
            var result = await _service.ExistsAsync(999);

            // Assert
            Assert.False(result);
        }
    }
}
