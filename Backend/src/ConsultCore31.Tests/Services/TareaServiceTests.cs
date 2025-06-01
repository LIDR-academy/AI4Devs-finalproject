using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using ConsultCore31.Application.DTOs.Tarea;
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
    /// Pruebas unitarias para el servicio de tareas
    /// </summary>
    public class TareaServiceTests
    {
        private readonly Mock<ITareaRepository> _mockRepository;
        private readonly IMapper _mapper;
        private readonly Mock<ILogger<TareaService>> _mockLogger;
        private readonly TareaService _service;

        public TareaServiceTests()
        {
            _mockRepository = new Mock<ITareaRepository>();
            
            // Configurar AutoMapper
            var mapperConfig = new MapperConfiguration(cfg =>
            {
                cfg.AddProfile<TareaProfile>();
            });
            _mapper = mapperConfig.CreateMapper();
            
            _mockLogger = new Mock<ILogger<TareaService>>();
            
            // Crear el servicio con las dependencias mockeadas
            _service = new TareaService(
                _mockRepository.Object,
                _mapper,
                _mockLogger.Object);
        }

        [Fact]
        public async Task GetAllAsync_DebeRetornarTodasLasTareas()
        {
            // Arrange
            var tareas = new List<Tarea>
            {
                new Tarea { 
                    Id = 1, 
                    Titulo = "Tarea 1", 
                    ProyectoId = 1,
                    EstadoTareaId = 1,
                    PrioridadTareaId = 1,
                    CreadoPorId = 1,
                    FechaCreacion = DateTime.UtcNow 
                },
                new Tarea { 
                    Id = 2, 
                    Titulo = "Tarea 2", 
                    ProyectoId = 1,
                    EstadoTareaId = 1,
                    PrioridadTareaId = 2,
                    CreadoPorId = 1,
                    FechaCreacion = DateTime.UtcNow 
                }
            };

            _mockRepository.Setup(repo => repo.GetAllActiveAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(tareas);

            // Act
            var result = await _service.GetAllAsync();

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count());
            Assert.Contains(result, dto => dto.Titulo == "Tarea 1");
            Assert.Contains(result, dto => dto.Titulo == "Tarea 2");
        }

        [Fact]
        public async Task GetByIdAsync_ConIdExistente_DebeRetornarTarea()
        {
            // Arrange
            var tarea = new Tarea 
            { 
                Id = 1, 
                Titulo = "Tarea Test", 
                ProyectoId = 1,
                EstadoTareaId = 1,
                PrioridadTareaId = 1,
                CreadoPorId = 1,
                FechaCreacion = DateTime.UtcNow 
            };

            _mockRepository.Setup(repo => repo.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(tarea);

            // Act
            var result = await _service.GetByIdAsync(1);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(1, result.Id);
            Assert.Equal("Tarea Test", result.Titulo);
            Assert.Equal(1, result.ProyectoId);
        }

        [Fact]
        public async Task GetByIdAsync_ConIdInexistente_DebeRetornarNull()
        {
            // Arrange
            _mockRepository.Setup(repo => repo.GetByIdAsync(999, It.IsAny<CancellationToken>()))
                .ReturnsAsync((Tarea)null);

            // Act
            var result = await _service.GetByIdAsync(999);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task CreateAsync_DebeCrearYRetornarTarea()
        {
            // Arrange
            var createDto = new CreateTareaDto
            {
                Titulo = "Nueva Tarea",
                ProyectoId = 1,
                EstadoTareaId = 1,
                PrioridadTareaId = 1,
                CreadoPorId = 1,
                Activa = true
            };

            var createdEntity = new Tarea
            {
                Id = 1,
                Titulo = "Nueva Tarea",
                ProyectoId = 1,
                EstadoTareaId = 1,
                PrioridadTareaId = 1,
                CreadoPorId = 1,
                Activo = true,
                FechaCreacion = DateTime.UtcNow
            };

            _mockRepository.Setup(repo => repo.AddAsync(It.IsAny<Tarea>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(createdEntity);

            // Act
            var result = await _service.CreateAsync(createDto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(1, result.Id);
            Assert.Equal("Nueva Tarea", result.Titulo);
            Assert.Equal(1, result.ProyectoId);
        }

        [Fact]
        public async Task UpdateAsync_ConIdExistente_DebeActualizarYRetornarTrue()
        {
            // Arrange
            var updateDto = new UpdateTareaDto
            {
                Id = 1,
                Titulo = "Tarea Actualizada",
                ProyectoId = 1,
                EstadoTareaId = 2,
                PrioridadTareaId = 2,
                Activa = true
            };

            var existingEntity = new Tarea
            {
                Id = 1,
                Titulo = "Tarea Original",
                ProyectoId = 1,
                EstadoTareaId = 1,
                PrioridadTareaId = 1,
                CreadoPorId = 1,
                Activo = true,
                FechaCreacion = DateTime.UtcNow.AddDays(-10)
            };

            _mockRepository.Setup(repo => repo.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(existingEntity);

            // Act
            var result = await _service.UpdateAsync(updateDto);

            // Assert
            Assert.True(result);
            _mockRepository.Verify(repo => repo.UpdateAsync(It.Is<Tarea>(e => 
                e.Id == 1 && 
                e.Titulo == "Tarea Actualizada" && 
                e.EstadoTareaId == 2 && 
                e.PrioridadTareaId == 2), It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task UpdateAsync_ConIdInexistente_DebeRetornarFalse()
        {
            // Arrange
            var updateDto = new UpdateTareaDto
            {
                Id = 999,
                Titulo = "Tarea Actualizada",
                ProyectoId = 1,
                EstadoTareaId = 2,
                PrioridadTareaId = 2,
                Activa = true
            };

            _mockRepository.Setup(repo => repo.GetByIdAsync(999, It.IsAny<CancellationToken>()))
                .ReturnsAsync((Tarea)null);

            // Act
            var result = await _service.UpdateAsync(updateDto);

            // Assert
            Assert.False(result);
            _mockRepository.Verify(repo => repo.UpdateAsync(It.IsAny<Tarea>(), It.IsAny<CancellationToken>()), Times.Never);
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
