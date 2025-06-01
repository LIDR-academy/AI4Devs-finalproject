using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using ConsultCore31.Application.DTOs.PrioridadTarea;
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
    /// Pruebas unitarias para el servicio de prioridades de tarea
    /// </summary>
    public class PrioridadTareaServiceTests
    {
        private readonly Mock<IGenericRepository<PrioridadTarea, int>> _mockRepository;
        private readonly Mock<ILogger<PrioridadTareaService>> _mockLogger;
        private readonly IMapper _mapper;
        private readonly PrioridadTareaService _service;

        public PrioridadTareaServiceTests()
        {
            _mockRepository = new Mock<IGenericRepository<PrioridadTarea, int>>();
            _mockLogger = new Mock<ILogger<PrioridadTareaService>>();
            
            // Configurar AutoMapper
            var mapperConfig = new MapperConfiguration(cfg =>
            {
                cfg.AddProfile<PrioridadTareaProfile>();
            });
            _mapper = mapperConfig.CreateMapper();
            
            // Crear el servicio con las dependencias mockeadas
            _service = new PrioridadTareaService(_mockRepository.Object, _mapper, _mockLogger.Object);
        }

        [Fact]
        public async Task GetAllAsync_DebeRetornarTodasLasPrioridades()
        {
            // Arrange
            var prioridades = new List<PrioridadTarea>
            {
                new PrioridadTarea { Id = 1, Nombre = "Alta", Descripcion = "Prioridad alta", CreatedAt = DateTime.UtcNow },
                new PrioridadTarea { Id = 2, Nombre = "Media", Descripcion = "Prioridad media", CreatedAt = DateTime.UtcNow }
            };

            _mockRepository.Setup(repo => repo.GetAllActiveAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(prioridades);

            // Act
            var result = await _service.GetAllAsync();

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count());
            Assert.Contains(result, dto => dto.Nombre == "Alta");
            Assert.Contains(result, dto => dto.Nombre == "Media");
        }

        [Fact]
        public async Task GetByIdAsync_ConIdExistente_DebeRetornarPrioridad()
        {
            // Arrange
            var prioridad = new PrioridadTarea
            { 
                Id = 1, 
                Nombre = "Alta", 
                Descripcion = "Prioridad alta", 
                CreatedAt = DateTime.UtcNow 
            };

            _mockRepository.Setup(repo => repo.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(prioridad);

            // Act
            var result = await _service.GetByIdAsync(1);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(1, result.Id);
            Assert.Equal("Alta", result.Nombre);
            Assert.Equal("Prioridad alta", result.Descripcion);
        }

        [Fact]
        public async Task GetByIdAsync_ConIdInexistente_DebeRetornarNull()
        {
            // Arrange
            _mockRepository.Setup(repo => repo.GetByIdAsync(999, It.IsAny<CancellationToken>()))
                .ReturnsAsync((PrioridadTarea)null);

            // Act
            var result = await _service.GetByIdAsync(999);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task CreateAsync_DebeCrearYRetornarPrioridad()
        {
            // Arrange
            var createDto = new CreatePrioridadTareaDto
            {
                Nombre = "Baja",
                Descripcion = "Prioridad baja"
            };

            var newEntity = new PrioridadTarea
            {
                Id = 3,
                Nombre = "Baja",
                Descripcion = "Prioridad baja",
                Activo = true,
                CreatedAt = DateTime.UtcNow
            };

            _mockRepository.Setup(repo => repo.AddAsync(It.IsAny<PrioridadTarea>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(newEntity);

            // Act
            var result = await _service.CreateAsync(createDto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(3, result.Id);
            Assert.Equal("Baja", result.Nombre);
            Assert.Equal("Prioridad baja", result.Descripcion);
            _mockRepository.Verify(repo => repo.AddAsync(It.Is<PrioridadTarea>(t => 
                t.Nombre == "Baja" && 
                t.Descripcion == "Prioridad baja" && 
                t.Activo), It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task UpdateAsync_ConIdExistente_DebeActualizarYRetornarTrue()
        {
            // Arrange
            var updateDto = new UpdatePrioridadTareaDto
            {
                Id = 1,
                Nombre = "Alta Actualizada",
                Descripcion = "Descripción actualizada",
                Activo = true
            };

            var existingEntity = new PrioridadTarea
            {
                Id = 1,
                Nombre = "Alta",
                Descripcion = "Prioridad alta",
                Activo = true,
                CreatedAt = DateTime.UtcNow
            };

            _mockRepository.Setup(repo => repo.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(existingEntity);

            // Act
            var result = await _service.UpdateAsync(updateDto);

            // Assert
            Assert.True(result);
            _mockRepository.Verify(repo => repo.UpdateAsync(It.Is<PrioridadTarea>(t => 
                t.Id == 1 && 
                t.Nombre == "Alta Actualizada" && 
                t.Descripcion == "Descripción actualizada" && 
                t.Activo), It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task UpdateAsync_ConIdInexistente_DebeRetornarFalse()
        {
            // Arrange
            var updateDto = new UpdatePrioridadTareaDto
            {
                Id = 999,
                Nombre = "Prioridad Inexistente",
                Descripcion = "Descripción inexistente",
                Activo = true
            };

            _mockRepository.Setup(repo => repo.GetByIdAsync(999, It.IsAny<CancellationToken>()))
                .ReturnsAsync((PrioridadTarea)null);

            // Act
            var result = await _service.UpdateAsync(updateDto);

            // Assert
            Assert.False(result);
            _mockRepository.Verify(repo => repo.UpdateAsync(It.IsAny<PrioridadTarea>(), It.IsAny<CancellationToken>()), Times.Never);
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
