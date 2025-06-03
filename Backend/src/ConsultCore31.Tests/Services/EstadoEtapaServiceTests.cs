using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using ConsultCore31.Application.DTOs.EstadoEtapa;
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
    /// Pruebas unitarias para el servicio de estados de etapa
    /// </summary>
    public class EstadoEtapaServiceTests
    {
        private readonly Mock<IGenericRepository<EstadoEtapa, int>> _mockRepository;
        private readonly Mock<ILogger<EstadoEtapaService>> _mockLogger;
        private readonly IMapper _mapper;
        private readonly EstadoEtapaService _service;

        public EstadoEtapaServiceTests()
        {
            _mockRepository = new Mock<IGenericRepository<EstadoEtapa, int>>();
            _mockLogger = new Mock<ILogger<EstadoEtapaService>>();
            
            // Configurar AutoMapper
            var mapperConfig = new MapperConfiguration(cfg =>
            {
                cfg.AddProfile<EstadoEtapaProfile>();
            });
            _mapper = mapperConfig.CreateMapper();
            
            // Crear el servicio con las dependencias mockeadas
            _service = new EstadoEtapaService(_mockRepository.Object, _mapper, _mockLogger.Object);
        }

        [Fact]
        public async Task GetAllAsync_DebeRetornarTodosLosEstados()
        {
            // Arrange
            var estados = new List<EstadoEtapa>
            {
                new EstadoEtapa { Id = 1, Nombre = "Planificación", Descripcion = "Etapa de planificación", FechaCreacion = DateTime.UtcNow },
                new EstadoEtapa { Id = 2, Nombre = "Ejecución", Descripcion = "Etapa de ejecución", FechaCreacion = DateTime.UtcNow }
            };

            _mockRepository.Setup(repo => repo.GetAllActiveAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(estados);

            // Act
            var result = await _service.GetAllAsync();

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count());
            Assert.Contains(result, dto => dto.Nombre == "Planificación");
            Assert.Contains(result, dto => dto.Nombre == "Ejecución");
        }

        [Fact]
        public async Task GetByIdAsync_ConIdExistente_DebeRetornarEstado()
        {
            // Arrange
            var estado = new EstadoEtapa
            { 
                Id = 1, 
                Nombre = "Planificación", 
                Descripcion = "Etapa de planificación", 
                FechaCreacion = DateTime.UtcNow 
            };

            _mockRepository.Setup(repo => repo.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(estado);

            // Act
            var result = await _service.GetByIdAsync(1, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(1, result.Id);
            Assert.Equal("Planificación", result.Nombre);
            Assert.Equal("Etapa de planificación", result.Descripcion);
        }

        [Fact]
        public async Task GetByIdAsync_ConIdInexistente_DebeRetornarNull()
        {
            // Arrange
            _mockRepository.Setup(repo => repo.GetByIdAsync(999, It.IsAny<CancellationToken>()))
                .ReturnsAsync((EstadoEtapa)null);

            // Act
            var result = await _service.GetByIdAsync(999, CancellationToken.None);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task CreateAsync_DebeCrearYRetornarEstado()
        {
            // Arrange
            var createDto = new CreateEstadoEtapaDto
            {
                Nombre = "Cierre",
                Descripcion = "Etapa de cierre"
            };

            var newEntity = new EstadoEtapa
            {
                Id = 3,
                Nombre = "Cierre",
                Descripcion = "Etapa de cierre",
                Activo = true,
                FechaCreacion = DateTime.UtcNow
            };

            _mockRepository.Setup(repo => repo.AddAsync(It.IsAny<EstadoEtapa>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(newEntity);

            // Act
            var result = await _service.CreateAsync(createDto, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(3, result.Id);
            Assert.Equal("Cierre", result.Nombre);
            Assert.Equal("Etapa de cierre", result.Descripcion);
            _mockRepository.Verify(repo => repo.AddAsync(It.Is<EstadoEtapa>(t => 
                t.Nombre == "Cierre" && 
                t.Descripcion == "Etapa de cierre" && 
                t.Activo), It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task UpdateAsync_ConIdExistente_DebeActualizarYRetornarTrue()
        {
            // Arrange
            var updateDto = new UpdateEstadoEtapaDto
            {
                Id = 1,
                Nombre = "Planificación Actualizada",
                Descripcion = "Descripción actualizada",
                Activo = true
            };

            var existingEntity = new EstadoEtapa
            {
                Id = 1,
                Nombre = "Planificación",
                Descripcion = "Etapa de planificación",
                Activo = true,
                FechaCreacion = DateTime.UtcNow
            };

            _mockRepository.Setup(repo => repo.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(existingEntity);

            // Act
            var result = await _service.UpdateAsync(updateDto, CancellationToken.None);

            // Assert
            Assert.True(result);
            _mockRepository.Verify(repo => repo.UpdateAsync(It.Is<EstadoEtapa>(t => 
                t.Id == 1 && 
                t.Nombre == "Planificación Actualizada" && 
                t.Descripcion == "Descripción actualizada" && 
                t.Activo), It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task UpdateAsync_ConIdInexistente_DebeRetornarFalse()
        {
            // Arrange
            var updateDto = new UpdateEstadoEtapaDto
            {
                Id = 999,
                Nombre = "Estado Inexistente",
                Descripcion = "Descripción inexistente",
                Activo = true
            };

            _mockRepository.Setup(repo => repo.GetByIdAsync(999, It.IsAny<CancellationToken>()))
                .ReturnsAsync((EstadoEtapa)null);

            // Act
            var result = await _service.UpdateAsync(updateDto, CancellationToken.None);

            // Assert
            Assert.False(result);
            _mockRepository.Verify(repo => repo.UpdateAsync(It.IsAny<EstadoEtapa>(), It.IsAny<CancellationToken>()), Times.Never);
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
