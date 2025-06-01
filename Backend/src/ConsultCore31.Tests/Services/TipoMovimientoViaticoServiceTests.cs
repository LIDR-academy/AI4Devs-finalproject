using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using ConsultCore31.Application.DTOs.TipoMovimientoViatico;
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
    /// Pruebas unitarias para el servicio de tipos de movimiento de viático
    /// </summary>
    public class TipoMovimientoViaticoServiceTests
    {
        private readonly Mock<IGenericRepository<TipoMovimientoViatico, int>> _mockRepository;
        private readonly Mock<ILogger<TipoMovimientoViaticoService>> _mockLogger;
        private readonly IMapper _mapper;
        private readonly TipoMovimientoViaticoService _service;

        public TipoMovimientoViaticoServiceTests()
        {
            _mockRepository = new Mock<IGenericRepository<TipoMovimientoViatico, int>>();
            _mockLogger = new Mock<ILogger<TipoMovimientoViaticoService>>();
            
            // Configurar AutoMapper
            var mapperConfig = new MapperConfiguration(cfg =>
            {
                cfg.AddProfile<TipoMovimientoViaticoProfile>();
            });
            _mapper = mapperConfig.CreateMapper();
            
            // Crear el servicio con las dependencias mockeadas
            _service = new TipoMovimientoViaticoService(_mockRepository.Object, _mapper, _mockLogger.Object);
        }

        [Fact]
        public async Task GetAllAsync_DebeRetornarTodosLosTipos()
        {
            // Arrange
            var tipos = new List<TipoMovimientoViatico>
            {
                new TipoMovimientoViatico { Id = 1, Nombre = "Anticipo", Descripcion = "Anticipo de viáticos", EsEntrada = true, CreatedAt = DateTime.UtcNow },
                new TipoMovimientoViatico { Id = 2, Nombre = "Gasto", Descripcion = "Gasto de viáticos", EsEntrada = false, CreatedAt = DateTime.UtcNow }
            };

            _mockRepository.Setup(repo => repo.GetAllActiveAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(tipos);

            // Act
            var result = await _service.GetAllAsync();

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count());
            Assert.Contains(result, dto => dto.Nombre == "Anticipo");
            Assert.Contains(result, dto => dto.Nombre == "Gasto");
        }

        [Fact]
        public async Task GetByIdAsync_ConIdExistente_DebeRetornarTipo()
        {
            // Arrange
            var tipo = new TipoMovimientoViatico
            { 
                Id = 1, 
                Nombre = "Anticipo", 
                Descripcion = "Anticipo de viáticos", 
                EsEntrada = true, 
                CreatedAt = DateTime.UtcNow 
            };

            _mockRepository.Setup(repo => repo.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(tipo);

            // Act
            var result = await _service.GetByIdAsync(1);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(1, result.Id);
            Assert.Equal("Anticipo", result.Nombre);
            Assert.Equal("Anticipo de viáticos", result.Descripcion);
            Assert.True(result.EsEntrada);
        }

        [Fact]
        public async Task GetByIdAsync_ConIdInexistente_DebeRetornarNull()
        {
            // Arrange
            _mockRepository.Setup(repo => repo.GetByIdAsync(999, It.IsAny<CancellationToken>()))
                .ReturnsAsync((TipoMovimientoViatico)null);

            // Act
            var result = await _service.GetByIdAsync(999);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task CreateAsync_DebeCrearYRetornarTipo()
        {
            // Arrange
            var createDto = new CreateTipoMovimientoViaticoDto
            {
                Nombre = "Reembolso",
                Descripcion = "Reembolso de viáticos",
                EsEntrada = true,
                Activo = true
            };

            TipoMovimientoViatico savedEntity = null;

            _mockRepository.Setup(repo => repo.AddAsync(It.IsAny<TipoMovimientoViatico>(), It.IsAny<CancellationToken>()))
                .Callback<TipoMovimientoViatico, CancellationToken>((entity, token) => 
                {
                    entity.Id = 3;
                    entity.CreatedAt = DateTime.UtcNow;
                    savedEntity = entity;
                })
                .ReturnsAsync((TipoMovimientoViatico entity, CancellationToken token) => entity);

            // Act
            var result = await _service.CreateAsync(createDto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(3, result.Id);
            Assert.Equal("Reembolso", result.Nombre);
            Assert.Equal("Reembolso de viáticos", result.Descripcion);
            Assert.True(result.EsEntrada);
            Assert.True(result.Activo);

            _mockRepository.Verify(repo => repo.AddAsync(It.IsAny<TipoMovimientoViatico>(), It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task UpdateAsync_ConIdExistente_DebeActualizarYRetornarTrue()
        {
            // Arrange
            var updateDto = new UpdateTipoMovimientoViaticoDto
            {
                Id = 1,
                Nombre = "Anticipo Actualizado",
                Descripcion = "Descripción actualizada",
                EsEntrada = false,
                Activo = true
            };

            var existingEntity = new TipoMovimientoViatico
            {
                Id = 1,
                Nombre = "Anticipo",
                Descripcion = "Anticipo de viáticos",
                EsEntrada = true,
                Activo = true,
                CreatedAt = DateTime.UtcNow
            };

            _mockRepository.Setup(repo => repo.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(existingEntity);

            // Act
            var result = await _service.UpdateAsync(updateDto);

            // Assert
            Assert.True(result);
            _mockRepository.Verify(repo => repo.UpdateAsync(It.Is<TipoMovimientoViatico>(t => 
                t.Id == 1 && 
                t.Nombre == "Anticipo Actualizado" && 
                t.Descripcion == "Descripción actualizada" && 
                !t.EsEntrada && 
                t.Activo), It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task UpdateAsync_ConIdInexistente_DebeRetornarFalse()
        {
            // Arrange
            var updateDto = new UpdateTipoMovimientoViaticoDto
            {
                Id = 999,
                Nombre = "Tipo Inexistente",
                Descripcion = "Descripción inexistente",
                EsEntrada = true,
                Activo = true
            };

            _mockRepository.Setup(repo => repo.GetByIdAsync(999, It.IsAny<CancellationToken>()))
                .ReturnsAsync((TipoMovimientoViatico)null);

            // Act
            var result = await _service.UpdateAsync(updateDto);

            // Assert
            Assert.False(result);
            _mockRepository.Verify(repo => repo.UpdateAsync(It.IsAny<TipoMovimientoViatico>(), It.IsAny<CancellationToken>()), Times.Never);
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
