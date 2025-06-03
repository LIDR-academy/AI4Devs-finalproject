using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using ConsultCore31.Application.DTOs.EtapaProyecto;
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
    /// Pruebas unitarias para el servicio de etapas de proyecto
    /// </summary>
    public class EtapaProyectoServiceTests
    {
        private readonly Mock<IEtapaProyectoRepository> _mockRepository;
        private readonly IMapper _mapper;
        private readonly Mock<ILogger<EtapaProyectoService>> _mockLogger;
        private readonly EtapaProyectoService _service;

        public EtapaProyectoServiceTests()
        {
            _mockRepository = new Mock<IEtapaProyectoRepository>();
            
            // Configurar AutoMapper
            var mapperConfig = new MapperConfiguration(cfg =>
            {
                cfg.AddProfile<EtapaProyectoProfile>();
            });
            _mapper = mapperConfig.CreateMapper();
            
            _mockLogger = new Mock<ILogger<EtapaProyectoService>>();
            
            // Crear el servicio con las dependencias mockeadas
            _service = new EtapaProyectoService(
                _mockRepository.Object,
                _mapper,
                _mockLogger.Object);
        }

        [Fact]
        public async Task GetAllAsync_DebeRetornarTodasLasEtapasProyecto()
        {
            // Arrange
            var etapasProyecto = new List<EtapaProyecto>
            {
                new EtapaProyecto { 
                    Id = 1, 
                    Nombre = "Etapa 1", 
                    ProyectoId = 1,
                    Descripcion = "Descripción de la etapa 1",
                    Orden = 1,
                    EstadoEtapaId = 1,
                    FechaCreacion = DateTime.UtcNow 
                },
                new EtapaProyecto { 
                    Id = 2, 
                    Nombre = "Etapa 2", 
                    ProyectoId = 1,
                    Descripcion = "Descripción de la etapa 2",
                    Orden = 2,
                    EstadoEtapaId = 1,
                    FechaCreacion = DateTime.UtcNow 
                }
            };

            _mockRepository.Setup(repo => repo.GetAllActiveAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(etapasProyecto);

            // Act
            var result = await _service.GetAllAsync();

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count());
            Assert.Contains(result, dto => dto.Nombre == "Etapa 1");
            Assert.Contains(result, dto => dto.Nombre == "Etapa 2");
        }

        [Fact]
        public async Task GetByIdAsync_ConIdExistente_DebeRetornarEtapaProyecto()
        {
            // Arrange
            var etapaProyecto = new EtapaProyecto 
            { 
                Id = 1, 
                Nombre = "Etapa Test", 
                ProyectoId = 1,
                Descripcion = "Descripción de la etapa de prueba",
                Orden = 1,
                EstadoEtapaId = 1,
                FechaCreacion = DateTime.UtcNow 
            };

            _mockRepository.Setup(repo => repo.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(etapaProyecto);

            // Act
            var result = await _service.GetByIdAsync(1);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(1, result.Id);
            Assert.Equal("Etapa Test", result.Nombre);
            Assert.Equal(1, result.ProyectoId);
        }

        [Fact]
        public async Task GetByIdAsync_ConIdInexistente_DebeRetornarNull()
        {
            // Arrange
            _mockRepository.Setup(repo => repo.GetByIdAsync(999, It.IsAny<CancellationToken>()))
                .ReturnsAsync((EtapaProyecto)null);

            // Act
            var result = await _service.GetByIdAsync(999);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task CreateAsync_DebeCrearYRetornarEtapaProyecto()
        {
            // Arrange
            var createDto = new CreateEtapaProyectoDto
            {
                Nombre = "Nueva Etapa",
                ProyectoId = 1,
                Descripcion = "Descripción de la nueva etapa",
                Orden = 1,
                FechaInicio = DateTime.UtcNow,
                FechaFin = DateTime.UtcNow.AddMonths(1),
                EstadoEtapaId = 1,
                Activa = true
            };

            var createdEntity = new EtapaProyecto
            {
                Id = 1,
                Nombre = "Nueva Etapa",
                ProyectoId = 1,
                Descripcion = "Descripción de la nueva etapa",
                Orden = 1,
                FechaInicio = DateTime.UtcNow,
                FechaFin = DateTime.UtcNow.AddMonths(1),
                EstadoEtapaId = 1,
                Activa = true,
                FechaCreacion = DateTime.UtcNow
            };

            _mockRepository.Setup(repo => repo.AddAsync(It.IsAny<EtapaProyecto>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(createdEntity);

            // Act
            var result = await _service.CreateAsync(createDto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(1, result.Id);
            Assert.Equal("Nueva Etapa", result.Nombre);
            Assert.Equal(1, result.ProyectoId);
        }

        [Fact]
        public async Task UpdateAsync_ConIdExistente_DebeActualizarYRetornarTrue()
        {
            // Arrange
            var updateDto = new UpdateEtapaProyectoDto
            {
                Id = 1,
                Nombre = "Etapa Actualizada",
                ProyectoId = 1,
                Descripcion = "Descripción de la etapa actualizada",
                Orden = 2,
                FechaInicio = DateTime.UtcNow,
                FechaFin = DateTime.UtcNow.AddMonths(2),
                EstadoEtapaId = 2,
                Activa = true
            };

            var existingEntity = new EtapaProyecto
            {
                Id = 1,
                Nombre = "Etapa Original",
                ProyectoId = 1,
                Descripcion = "Descripción de la etapa original",
                Orden = 1,
                FechaInicio = DateTime.UtcNow.AddDays(-10),
                FechaFin = DateTime.UtcNow.AddMonths(1),
                EstadoEtapaId = 1,
                Activa = true,
                FechaCreacion = DateTime.UtcNow.AddDays(-10)
            };

            _mockRepository.Setup(repo => repo.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(existingEntity);

            // Act
            var result = await _service.UpdateAsync(updateDto);

            // Assert
            Assert.True(result);
            _mockRepository.Verify(repo => repo.UpdateAsync(It.Is<EtapaProyecto>(e => 
                e.Id == 1 && 
                e.Nombre == "Etapa Actualizada" && 
                e.Descripcion == "Descripción de la etapa actualizada" && 
                e.Orden == 2 && 
                e.EstadoEtapaId == 2), It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task UpdateAsync_ConIdInexistente_DebeRetornarFalse()
        {
            // Arrange
            var updateDto = new UpdateEtapaProyectoDto
            {
                Id = 999,
                Nombre = "Etapa Actualizada",
                ProyectoId = 1,
                Descripcion = "Descripción de la etapa actualizada",
                Orden = 2,
                FechaInicio = DateTime.UtcNow,
                FechaFin = DateTime.UtcNow.AddMonths(2),
                EstadoEtapaId = 2,
                Activa = true
            };

            _mockRepository.Setup(repo => repo.GetByIdAsync(999, It.IsAny<CancellationToken>()))
                .ReturnsAsync((EtapaProyecto)null);

            // Act
            var result = await _service.UpdateAsync(updateDto);

            // Assert
            Assert.False(result);
            _mockRepository.Verify(repo => repo.UpdateAsync(It.IsAny<EtapaProyecto>(), It.IsAny<CancellationToken>()), Times.Never);
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
