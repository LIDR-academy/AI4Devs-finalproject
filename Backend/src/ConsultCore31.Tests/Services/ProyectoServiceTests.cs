using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using ConsultCore31.Application.DTOs.Proyecto;
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
    /// Pruebas unitarias para el servicio de proyectos
    /// </summary>
    public class ProyectoServiceTests
    {
        private readonly Mock<IProyectoRepository> _mockRepository;
        private readonly IMapper _mapper;
        private readonly Mock<ILogger<ProyectoService>> _mockLogger;
        private readonly ProyectoService _service;

        public ProyectoServiceTests()
        {
            _mockRepository = new Mock<IProyectoRepository>();
            
            // Configurar AutoMapper
            var mapperConfig = new MapperConfiguration(cfg =>
            {
                cfg.AddProfile<ProyectoProfile>();
            });
            _mapper = mapperConfig.CreateMapper();
            
            _mockLogger = new Mock<ILogger<ProyectoService>>();
            
            // Crear el servicio con las dependencias mockeadas
            _service = new ProyectoService(
                _mockRepository.Object,
                _mapper,
                _mockLogger.Object);
        }

        [Fact]
        public async Task GetAllAsync_DebeRetornarTodosLosProyectos()
        {
            // Arrange
            var proyectos = new List<Proyecto>
            {
                new Proyecto { 
                    Id = 1, 
                    Nombre = "Proyecto 1", 
                    Codigo = "PRO-001", 
                    Descripcion = "Descripción del proyecto 1",
                    FechaInicio = DateTime.UtcNow,
                    FechaFinPlanificada = DateTime.UtcNow.AddMonths(3),
                    EstadoProyectoId = 1,
                    TipoProyectoId = 1,
                    ClienteId = 1,
                    FechaCreacion = DateTime.UtcNow 
                },
                new Proyecto { 
                    Id = 2, 
                    Nombre = "Proyecto 2", 
                    Codigo = "PRO-002", 
                    Descripcion = "Descripción del proyecto 2",
                    FechaInicio = DateTime.UtcNow,
                    FechaFinPlanificada = DateTime.UtcNow.AddMonths(6),
                    EstadoProyectoId = 1,
                    TipoProyectoId = 2,
                    ClienteId = 2,
                    FechaCreacion = DateTime.UtcNow 
                }
            };

            _mockRepository.Setup(repo => repo.GetAllActiveAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(proyectos);

            // Act
            var result = await _service.GetAllAsync();

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count());
            Assert.Contains(result, dto => dto.Nombre == "Proyecto 1");
            Assert.Contains(result, dto => dto.Nombre == "Proyecto 2");
        }

        [Fact]
        public async Task GetByIdAsync_ConIdExistente_DebeRetornarProyecto()
        {
            // Arrange
            var proyecto = new Proyecto 
            { 
                Id = 1, 
                Nombre = "Proyecto Test", 
                Codigo = "PRO-TEST", 
                Descripcion = "Descripción del proyecto de prueba",
                FechaInicio = DateTime.UtcNow,
                FechaFinPlanificada = DateTime.UtcNow.AddMonths(3),
                EstadoProyectoId = 1,
                TipoProyectoId = 1,
                ClienteId = 1,
                FechaCreacion = DateTime.UtcNow 
            };

            _mockRepository.Setup(repo => repo.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(proyecto);

            // Act
            var result = await _service.GetByIdAsync(1);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(1, result.Id);
            Assert.Equal("Proyecto Test", result.Nombre);
            Assert.Equal("PRO-TEST", result.Codigo);
        }

        [Fact]
        public async Task GetByIdAsync_ConIdInexistente_DebeRetornarNull()
        {
            // Arrange
            _mockRepository.Setup(repo => repo.GetByIdAsync(999, It.IsAny<CancellationToken>()))
                .ReturnsAsync((Proyecto)null);

            // Act
            var result = await _service.GetByIdAsync(999);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task CreateAsync_DebeCrearYRetornarProyecto()
        {
            // Arrange
            var createDto = new CreateProyectoDto
            {
                Nombre = "Nuevo Proyecto",
                Codigo = "PRO-NUEVO",
                Descripcion = "Descripción del nuevo proyecto",
                FechaInicio = DateTime.UtcNow,
                FechaFinPlanificada = DateTime.UtcNow.AddMonths(3),
                EstadoProyectoId = 1,
                TipoProyectoId = 1,
                ClienteId = 1
            };

            var createdEntity = new Proyecto
            {
                Id = 1,
                Nombre = "Nuevo Proyecto",
                Codigo = "PRO-NUEVO",
                Descripcion = "Descripción del nuevo proyecto",
                FechaInicio = DateTime.UtcNow,
                FechaFinPlanificada = DateTime.UtcNow.AddMonths(3),
                EstadoProyectoId = 1,
                TipoProyectoId = 1,
                ClienteId = 1,
                FechaCreacion = DateTime.UtcNow
            };

            _mockRepository.Setup(repo => repo.AddAsync(It.IsAny<Proyecto>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(createdEntity);

            // Act
            var result = await _service.CreateAsync(createDto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(1, result.Id);
            Assert.Equal("Nuevo Proyecto", result.Nombre);
            Assert.Equal("PRO-NUEVO", result.Codigo);
        }

        [Fact]
        public async Task UpdateAsync_ConIdExistente_DebeActualizarYRetornarTrue()
        {
            // Arrange
            var updateDto = new UpdateProyectoDto
            {
                Id = 1,
                Nombre = "Proyecto Actualizado",
                Codigo = "PRO-ACT",
                Descripcion = "Descripción del proyecto actualizado",
                FechaInicio = DateTime.UtcNow,
                FechaFinPlanificada = DateTime.UtcNow.AddMonths(4),
                FechaFinReal = DateTime.UtcNow.AddMonths(5),
                EstadoProyectoId = 2,
                TipoProyectoId = 2,
                ClienteId = 2
            };

            var existingEntity = new Proyecto
            {
                Id = 1,
                Nombre = "Proyecto Original",
                Codigo = "PRO-ORG",
                Descripcion = "Descripción del proyecto original",
                FechaInicio = DateTime.UtcNow.AddDays(-30),
                FechaFinPlanificada = DateTime.UtcNow.AddMonths(2),
                EstadoProyectoId = 1,
                TipoProyectoId = 1,
                ClienteId = 1,
                FechaCreacion = DateTime.UtcNow.AddDays(-30)
            };

            _mockRepository.Setup(repo => repo.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(existingEntity);

            // Act
            var result = await _service.UpdateAsync(updateDto);

            // Assert
            Assert.True(result);
            _mockRepository.Verify(repo => repo.UpdateAsync(It.Is<Proyecto>(p => 
                p.Id == 1 && 
                p.Nombre == "Proyecto Actualizado" && 
                p.Codigo == "PRO-ACT" && 
                p.Descripcion == "Descripción del proyecto actualizado" && 
                p.EstadoProyectoId == 2), It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task UpdateAsync_ConIdInexistente_DebeRetornarFalse()
        {
            // Arrange
            var updateDto = new UpdateProyectoDto
            {
                Id = 999,
                Nombre = "Proyecto Actualizado",
                Codigo = "PRO-ACT",
                Descripcion = "Descripción del proyecto actualizado",
                FechaInicio = DateTime.UtcNow,
                FechaFinPlanificada = DateTime.UtcNow.AddMonths(4),
                EstadoProyectoId = 2,
                TipoProyectoId = 2,
                ClienteId = 2
            };

            _mockRepository.Setup(repo => repo.GetByIdAsync(999, It.IsAny<CancellationToken>()))
                .ReturnsAsync((Proyecto)null);

            // Act
            var result = await _service.UpdateAsync(updateDto);

            // Assert
            Assert.False(result);
            _mockRepository.Verify(repo => repo.UpdateAsync(It.IsAny<Proyecto>(), It.IsAny<CancellationToken>()), Times.Never);
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
