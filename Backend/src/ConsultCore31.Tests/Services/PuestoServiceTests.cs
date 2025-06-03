using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using ConsultCore31.Application.DTOs.Puesto;
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
    /// Pruebas unitarias para el servicio de puestos
    /// </summary>
    public class PuestoServiceTests
    {
        private readonly Mock<IGenericRepository<Puesto, int>> _mockRepository;
        private readonly Mock<ILogger<PuestoService>> _mockLogger;
        private readonly IMapper _mapper;
        private readonly PuestoService _service;

        public PuestoServiceTests()
        {
            _mockRepository = new Mock<IGenericRepository<Puesto, int>>();
            _mockLogger = new Mock<ILogger<PuestoService>>();
            
            // Configurar AutoMapper
            var mapperConfig = new MapperConfiguration(cfg =>
            {
                cfg.AddProfile<PuestoProfile>();
            });
            _mapper = mapperConfig.CreateMapper();
            
            // Crear el servicio con las dependencias mockeadas
            _service = new PuestoService(_mockRepository.Object, _mapper, _mockLogger.Object);
        }

        [Fact]
        public async Task GetAllAsync_DebeRetornarTodosLosPuestos()
        {
            // Arrange
            var puestos = new List<Puesto>
            {
                new Puesto { Id = 1, Nombre = "Gerente", Descripcion = "Gerente de departamento", FechaCreacion = DateTime.UtcNow },
                new Puesto { Id = 2, Nombre = "Analista", Descripcion = "Analista de sistemas", FechaCreacion = DateTime.UtcNow }
            };

            _mockRepository.Setup(repo => repo.GetAllActiveAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(puestos);

            // Act
            var result = await _service.GetAllAsync();

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count());
            Assert.Contains(result, dto => dto.Nombre == "Gerente");
            Assert.Contains(result, dto => dto.Nombre == "Analista");
        }

        [Fact]
        public async Task GetByIdAsync_ConIdExistente_DebeRetornarPuesto()
        {
            // Arrange
            var puesto = new Puesto
            { 
                Id = 1, 
                Nombre = "Gerente", 
                Descripcion = "Gerente de departamento", 
                FechaCreacion = DateTime.UtcNow 
            };

            _mockRepository.Setup(repo => repo.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(puesto);

            // Act
            var result = await _service.GetByIdAsync(1, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(1, result.Id);
            Assert.Equal("Gerente", result.Nombre);
            Assert.Equal("Gerente de departamento", result.Descripcion);
            
        }

        [Fact]
        public async Task GetByIdAsync_ConIdInexistente_DebeRetornarNull()
        {
            // Arrange
            _mockRepository.Setup(repo => repo.GetByIdAsync(999, It.IsAny<CancellationToken>()))
                .ReturnsAsync((Puesto)null);

            // Act
            var result = await _service.GetByIdAsync(999, CancellationToken.None);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task CreateAsync_DebeCrearYRetornarPuesto()
        {
            // Arrange
            var createDto = new CreatePuestoDto
            {
                Nombre = "Desarrollador",
                Descripcion = "Desarrollador de software",
                
                Activo = true
            };

            Puesto savedEntity = null;

            _mockRepository.Setup(repo => repo.AddAsync(It.IsAny<Puesto>(), It.IsAny<CancellationToken>()))
                .Callback<Puesto, CancellationToken>((entity, token) => 
                {
                    entity.Id = 3;
                    entity.FechaCreacion = DateTime.UtcNow;
                    savedEntity = entity;
                })
                .ReturnsAsync((Puesto entity, CancellationToken token) => entity);

            // Act
            var result = await _service.CreateAsync(createDto, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(3, result.Id);
            Assert.Equal("Desarrollador", result.Nombre);
            Assert.Equal("Desarrollador de software", result.Descripcion);
            
            Assert.True(result.Activo);

            _mockRepository.Verify(repo => repo.AddAsync(It.IsAny<Puesto>(), It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task UpdateAsync_ConIdExistente_DebeActualizarYRetornarTrue()
        {
            // Arrange
            var updateDto = new UpdatePuestoDto
            {
                Id = 1,
                Nombre = "Gerente Senior",
                Descripcion = "Gerente senior de departamento",
                Activo = true
            };

            var existingEntity = new Puesto
            {
                Id = 1,
                Nombre = "Gerente",
                Descripcion = "Gerente de departamento",
                Activo = true,
                FechaCreacion = DateTime.UtcNow
            };

            _mockRepository.Setup(repo => repo.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(existingEntity);

            // Act
            var result = await _service.UpdateAsync(updateDto, CancellationToken.None);

            // Assert
            Assert.True(result);
            _mockRepository.Verify(repo => repo.UpdateAsync(It.Is<Puesto>(p => 
                p.Id == 1 && 
                p.Nombre == "Gerente Senior" && 
                p.Descripcion == "Gerente senior de departamento" && 
                p.Activo), It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task UpdateAsync_ConIdInexistente_DebeRetornarFalse()
        {
            // Arrange
            var updateDto = new UpdatePuestoDto
            {
                Id = 999,
                Nombre = "Puesto Inexistente",
                Descripcion = "Descripción inexistente",
                Activo = true
            };

            _mockRepository.Setup(repo => repo.GetByIdAsync(999, It.IsAny<CancellationToken>()))
                .ReturnsAsync((Puesto)null);

            // Act
            var result = await _service.UpdateAsync(updateDto, CancellationToken.None);

            // Assert
            Assert.False(result);
            _mockRepository.Verify(repo => repo.UpdateAsync(It.IsAny<Puesto>(), It.IsAny<CancellationToken>()), Times.Never);
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
