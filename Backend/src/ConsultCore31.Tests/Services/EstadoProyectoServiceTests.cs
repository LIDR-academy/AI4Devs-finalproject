using AutoMapper;
using ConsultCore31.Application.DTOs.EstadoProyecto;
using ConsultCore31.Application.Mappings;
using ConsultCore31.Application.Services;
using ConsultCore31.Core.Entities;
using ConsultCore31.Core.Interfaces;
using Microsoft.Extensions.Logging;
using Moq;
using System.Linq.Expressions;

namespace ConsultCore31.Tests.Services
{
    public class EstadoProyectoServiceTests
    {
        private readonly Mock<IGenericRepository<EstadoProyecto, int>> _mockRepository;
        private readonly Mock<ILogger<EstadoProyectoService>> _mockLogger;
        private readonly IMapper _mapper;
        private readonly EstadoProyectoService _service;

        public EstadoProyectoServiceTests()
        {
            _mockRepository = new Mock<IGenericRepository<EstadoProyecto, int>>();
            _mockLogger = new Mock<ILogger<EstadoProyectoService>>();
            
            // Configurar AutoMapper con el perfil de mapeo
            var mapperConfig = new MapperConfiguration(cfg =>
            {
                cfg.AddProfile<EstadoProyectoProfile>();
            });
            _mapper = mapperConfig.CreateMapper();
            
            _service = new EstadoProyectoService(_mockRepository.Object, _mapper, _mockLogger.Object);
        }

        [Fact]
        public async Task GetAllAsync_DebeRetornarTodosLosEstadosProyecto()
        {
            // Arrange
            var estadosProyecto = new List<EstadoProyecto>
            {
                new EstadoProyecto { Id = 1, Nombre = "Iniciado", Descripcion = "Proyecto recién iniciado", Color = "#00FF00", Orden = 1, EsEstadoFinal = false, Activo = true },
                new EstadoProyecto { Id = 2, Nombre = "En Progreso", Descripcion = "Proyecto en desarrollo", Color = "#FFFF00", Orden = 2, EsEstadoFinal = false, Activo = true },
                new EstadoProyecto { Id = 3, Nombre = "Finalizado", Descripcion = "Proyecto completado", Color = "#0000FF", Orden = 3, EsEstadoFinal = true, Activo = true }
            };

            _mockRepository.Setup(repo => repo.GetAllActiveAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(estadosProyecto);

            // Act
            var result = await _service.GetAllAsync();

            // Assert
            Assert.NotNull(result);
            Assert.Equal(3, result.Count());
            Assert.Contains(result, dto => dto.Nombre == "Iniciado");
            Assert.Contains(result, dto => dto.Nombre == "En Progreso");
            Assert.Contains(result, dto => dto.Nombre == "Finalizado");
            
            _mockRepository.Verify(repo => repo.GetAllActiveAsync(It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task GetByIdAsync_ConIdExistente_DebeRetornarEstadoProyecto()
        {
            // Arrange
            int estadoProyectoId = 1;
            var estadoProyecto = new EstadoProyecto 
            { 
                Id = estadoProyectoId, 
                Nombre = "Iniciado", 
                Descripcion = "Proyecto recién iniciado", 
                Color = "#00FF00", 
                Orden = 1, 
                EsEstadoFinal = false, 
                Activo = true 
            };

            _mockRepository.Setup(repo => repo.GetByIdAsync(estadoProyectoId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(estadoProyecto);

            // Act
            var result = await _service.GetByIdAsync(estadoProyectoId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(estadoProyectoId, result.Id);
            Assert.Equal("Iniciado", result.Nombre);
            Assert.Equal("Proyecto recién iniciado", result.Descripcion);
            Assert.Equal("#00FF00", result.Color);
            Assert.Equal(1, result.Orden);
            Assert.False(result.EsEstadoFinal);
            Assert.True(result.Activo);
            
            _mockRepository.Verify(repo => repo.GetByIdAsync(estadoProyectoId, It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task GetByIdAsync_ConIdInexistente_DebeRetornarNull()
        {
            // Arrange
            int estadoProyectoId = 999;

            _mockRepository.Setup(repo => repo.GetByIdAsync(estadoProyectoId, It.IsAny<CancellationToken>()))
                .ReturnsAsync((EstadoProyecto)null);

            // Act
            var result = await _service.GetByIdAsync(estadoProyectoId);

            // Assert
            Assert.Null(result);
            
            _mockRepository.Verify(repo => repo.GetByIdAsync(estadoProyectoId, It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task CreateAsync_ConDatosValidos_DebeCrearEstadoProyecto()
        {
            // Arrange
            var createDto = new CreateEstadoProyectoDto
            {
                Nombre = "Nuevo Estado",
                Descripcion = "Descripción del nuevo estado",
                Color = "#FF0000",
                Orden = 4,
                EsEstadoFinal = false,
                Activo = true
            };

            var estadoProyectoCreado = new EstadoProyecto
            {
                Id = 4,
                Nombre = "Nuevo Estado",
                Descripcion = "Descripción del nuevo estado",
                Color = "#FF0000",
                Orden = 4,
                EsEstadoFinal = false,
                Activo = true
            };

            _mockRepository.Setup(repo => repo.AddAsync(It.IsAny<EstadoProyecto>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(estadoProyectoCreado);

            // Act
            var result = await _service.CreateAsync(createDto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(4, result.Id);
            Assert.Equal("Nuevo Estado", result.Nombre);
            Assert.Equal("Descripción del nuevo estado", result.Descripcion);
            Assert.Equal("#FF0000", result.Color);
            Assert.Equal(4, result.Orden);
            Assert.False(result.EsEstadoFinal);
            Assert.True(result.Activo);
            
            _mockRepository.Verify(repo => repo.AddAsync(It.IsAny<EstadoProyecto>(), It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task UpdateAsync_ConIdExistente_DebeActualizarEstadoProyecto()
        {
            // Arrange
            var updateDto = new UpdateEstadoProyectoDto
            {
                Id = 1,
                Nombre = "Estado Actualizado",
                Descripcion = "Descripción actualizada",
                Color = "#FFAA00",
                Orden = 5,
                EsEstadoFinal = true,
                Activo = true
            };

            var estadoProyectoExistente = new EstadoProyecto
            {
                Id = 1,
                Nombre = "Iniciado",
                Descripcion = "Proyecto recién iniciado",
                Color = "#00FF00",
                Orden = 1,
                EsEstadoFinal = false,
                Activo = true
            };

            var estadoProyectoActualizado = new EstadoProyecto
            {
                Id = 1,
                Nombre = "Estado Actualizado",
                Descripcion = "Descripción actualizada",
                Color = "#FFAA00",
                Orden = 5,
                EsEstadoFinal = true,
                Activo = true
            };

            _mockRepository.Setup(repo => repo.GetByIdAsync(updateDto.Id, It.IsAny<CancellationToken>()))
                .ReturnsAsync(estadoProyectoExistente);

            _mockRepository.Setup(repo => repo.UpdateAsync(It.IsAny<EstadoProyecto>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(estadoProyectoActualizado);

            // Act
            var result = await _service.UpdateAsync(updateDto);

            // Assert
            Assert.True(result);
            
            _mockRepository.Verify(repo => repo.GetByIdAsync(updateDto.Id, It.IsAny<CancellationToken>()), Times.Once);
            _mockRepository.Verify(repo => repo.UpdateAsync(It.IsAny<EstadoProyecto>(), It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task UpdateAsync_ConIdInexistente_DebeLanzarException()
        {
            // Arrange
            var updateDto = new UpdateEstadoProyectoDto
            {
                Id = 999,
                Nombre = "Estado Inexistente",
                Descripcion = "Descripción de estado inexistente",
                Color = "#FFFFFF",
                Orden = 10,
                EsEstadoFinal = false,
                Activo = true
            };

            _mockRepository.Setup(repo => repo.GetByIdAsync(updateDto.Id, It.IsAny<CancellationToken>()))
                .ReturnsAsync((EstadoProyecto)null);

            // Act & Assert
            var exception = await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.UpdateAsync(updateDto));
            Assert.Contains("No se encontró el estado de proyecto", exception.Message);
            
            _mockRepository.Verify(repo => repo.GetByIdAsync(updateDto.Id, It.IsAny<CancellationToken>()), Times.Once);
            _mockRepository.Verify(repo => repo.UpdateAsync(It.IsAny<EstadoProyecto>(), It.IsAny<CancellationToken>()), Times.Never);
        }

        [Fact]
        public async Task DeleteAsync_ConIdExistente_DebeEliminarEstadoProyecto()
        {
            // Arrange
            int estadoProyectoId = 1;
            var estadoProyecto = new EstadoProyecto
            {
                Id = estadoProyectoId,
                Nombre = "Iniciado",
                Descripcion = "Proyecto recién iniciado",
                Color = "#00FF00",
                Orden = 1,
                EsEstadoFinal = false,
                Activo = true
            };

            _mockRepository.Setup(repo => repo.GetByIdAsync(estadoProyectoId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(estadoProyecto);

            _mockRepository.Setup(repo => repo.SoftDeleteAsync(estadoProyectoId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            // Act
            var result = await _service.DeleteAsync(estadoProyectoId);

            // Assert
            Assert.True(result);
            
            _mockRepository.Verify(repo => repo.GetByIdAsync(estadoProyectoId, It.IsAny<CancellationToken>()), Times.Once);
            _mockRepository.Verify(repo => repo.SoftDeleteAsync(estadoProyectoId, It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task DeleteAsync_ConIdInexistente_DebeLanzarException()
        {
            // Arrange
            int estadoProyectoId = 999;

            _mockRepository.Setup(repo => repo.GetByIdAsync(estadoProyectoId, It.IsAny<CancellationToken>()))
                .ReturnsAsync((EstadoProyecto)null);

            // Act & Assert
            var exception = await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.DeleteAsync(estadoProyectoId));
            Assert.Contains("No se encontró el estado de proyecto", exception.Message);
            
            _mockRepository.Verify(repo => repo.GetByIdAsync(estadoProyectoId, It.IsAny<CancellationToken>()), Times.Once);
            _mockRepository.Verify(repo => repo.SoftDeleteAsync(estadoProyectoId, It.IsAny<CancellationToken>()), Times.Never);
        }

        [Fact]
        public async Task ExistsAsync_ConIdExistente_DebeRetornarTrue()
        {
            // Arrange
            int estadoProyectoId = 1;

            _mockRepository.Setup(repo => repo.ExistsAsync(estadoProyectoId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            // Act
            var result = await _service.ExistsAsync(estadoProyectoId);

            // Assert
            Assert.True(result);
            
            _mockRepository.Verify(repo => repo.ExistsAsync(
                It.IsAny<Expression<Func<EstadoProyecto, bool>>>(), 
                It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task ExistsAsync_ConIdInexistente_DebeRetornarFalse()
        {
            // Arrange
            int estadoProyectoId = 999;

            _mockRepository.Setup(repo => repo.ExistsAsync(estadoProyectoId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);

            // Act
            var result = await _service.ExistsAsync(estadoProyectoId);

            // Assert
            Assert.False(result);
            
            _mockRepository.Verify(repo => repo.ExistsAsync(
                It.IsAny<Expression<Func<EstadoProyecto, bool>>>(), 
                It.IsAny<CancellationToken>()), Times.Once);
        }
    }
}
