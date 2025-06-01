using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using ConsultCore31.Application.DTOs.TipoProyecto;
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
    /// Pruebas unitarias para el servicio de tipos de proyecto
    /// </summary>
    public class TipoProyectoServiceTests
    {
        private readonly Mock<IGenericRepository<TipoProyecto, int>> _mockRepository;
        private readonly Mock<ILogger<TipoProyectoService>> _mockLogger;
        private readonly IMapper _mapper;
        private readonly TipoProyectoService _service;

        public TipoProyectoServiceTests()
        {
            _mockRepository = new Mock<IGenericRepository<TipoProyecto, int>>();
            _mockLogger = new Mock<ILogger<TipoProyectoService>>();
            
            // Configurar AutoMapper
            var mapperConfig = new MapperConfiguration(cfg =>
            {
                cfg.AddProfile<TipoProyectoProfile>();
            });
            _mapper = mapperConfig.CreateMapper();
            
            // Crear el servicio con las dependencias mockeadas
            _service = new TipoProyectoService(_mockRepository.Object, _mapper, _mockLogger.Object);
        }

        [Fact]
        public async Task GetAllAsync_DebeRetornarTodosLosTipos()
        {
            // Arrange
            var tipos = new List<TipoProyecto>
            {
                new TipoProyecto { Id = 1, Nombre = "Desarrollo", Descripcion = "Proyecto de desarrollo", CreatedAt = DateTime.UtcNow },
                new TipoProyecto { Id = 2, Nombre = "Consultoría", Descripcion = "Proyecto de consultoría", CreatedAt = DateTime.UtcNow }
            };

            _mockRepository.Setup(repo => repo.GetAllActiveAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(tipos);

            // Act
            var result = await _service.GetAllAsync();

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count());
            Assert.Contains(result, dto => dto.Nombre == "Desarrollo");
            Assert.Contains(result, dto => dto.Nombre == "Consultoría");
        }

        [Fact]
        public async Task GetByIdAsync_ConIdExistente_DebeRetornarTipo()
        {
            // Arrange
            var tipo = new TipoProyecto
            { 
                Id = 1, 
                Nombre = "Desarrollo", 
                Descripcion = "Proyecto de desarrollo", 
                CreatedAt = DateTime.UtcNow 
            };

            _mockRepository.Setup(repo => repo.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(tipo);

            // Act
            var result = await _service.GetByIdAsync(1);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(1, result.Id);
            Assert.Equal("Desarrollo", result.Nombre);
            Assert.Equal("Proyecto de desarrollo", result.Descripcion);
        }

        [Fact]
        public async Task GetByIdAsync_ConIdInexistente_DebeRetornarNull()
        {
            // Arrange
            _mockRepository.Setup(repo => repo.GetByIdAsync(999, It.IsAny<CancellationToken>()))
                .ReturnsAsync((TipoProyecto)null);

            // Act
            var result = await _service.GetByIdAsync(999);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task CreateAsync_DebeCrearYRetornarTipo()
        {
            // Arrange
            var createDto = new CreateTipoProyectoDto
            {
                Nombre = "Mantenimiento",
                Descripcion = "Proyecto de mantenimiento"
            };

            var newEntity = new TipoProyecto
            {
                Id = 3,
                Nombre = "Mantenimiento",
                Descripcion = "Proyecto de mantenimiento",
                Activo = true,
                CreatedAt = DateTime.UtcNow
            };

            _mockRepository.Setup(repo => repo.AddAsync(It.IsAny<TipoProyecto>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(newEntity);

            // Act
            var result = await _service.CreateAsync(createDto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(3, result.Id);
            Assert.Equal("Mantenimiento", result.Nombre);
            Assert.Equal("Proyecto de mantenimiento", result.Descripcion);
            _mockRepository.Verify(repo => repo.AddAsync(It.Is<TipoProyecto>(t => 
                t.Nombre == "Mantenimiento" && 
                t.Descripcion == "Proyecto de mantenimiento" && 
                t.Activo), It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task UpdateAsync_ConIdExistente_DebeActualizarYRetornarTrue()
        {
            // Arrange
            var updateDto = new UpdateTipoProyectoDto
            {
                Id = 1,
                Nombre = "Desarrollo Actualizado",
                Descripcion = "Descripción actualizada",
                Activo = true
            };

            var existingEntity = new TipoProyecto
            {
                Id = 1,
                Nombre = "Desarrollo",
                Descripcion = "Proyecto de desarrollo",
                Activo = true,
                CreatedAt = DateTime.UtcNow
            };

            _mockRepository.Setup(repo => repo.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(existingEntity);

            // Act
            var result = await _service.UpdateAsync(updateDto);

            // Assert
            Assert.True(result);
            _mockRepository.Verify(repo => repo.UpdateAsync(It.Is<TipoProyecto>(t => 
                t.Id == 1 && 
                t.Nombre == "Desarrollo Actualizado" && 
                t.Descripcion == "Descripción actualizada" && 
                t.Activo), It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task UpdateAsync_ConIdInexistente_DebeRetornarFalse()
        {
            // Arrange
            var updateDto = new UpdateTipoProyectoDto
            {
                Id = 999,
                Nombre = "Tipo Inexistente",
                Descripcion = "Descripción inexistente",
                Activo = true
            };

            _mockRepository.Setup(repo => repo.GetByIdAsync(999, It.IsAny<CancellationToken>()))
                .ReturnsAsync((TipoProyecto)null);

            // Act
            var result = await _service.UpdateAsync(updateDto);

            // Assert
            Assert.False(result);
            _mockRepository.Verify(repo => repo.UpdateAsync(It.IsAny<TipoProyecto>(), It.IsAny<CancellationToken>()), Times.Never);
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
