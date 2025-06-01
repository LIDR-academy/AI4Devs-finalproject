using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using ConsultCore31.Application.DTOs.ComentarioTarea;
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
    /// Pruebas unitarias para el servicio de comentarios de tarea
    /// </summary>
    public class ComentarioTareaServiceTests
    {
        private readonly Mock<IComentarioTareaRepository> _mockRepository;
        private readonly IMapper _mapper;
        private readonly Mock<ILogger<ComentarioTareaService>> _mockLogger;
        private readonly ComentarioTareaService _service;

        public ComentarioTareaServiceTests()
        {
            _mockRepository = new Mock<IComentarioTareaRepository>();
            
            // Configurar AutoMapper
            var mapperConfig = new MapperConfiguration(cfg =>
            {
                cfg.AddProfile<ComentarioTareaProfile>();
            });
            _mapper = mapperConfig.CreateMapper();
            
            _mockLogger = new Mock<ILogger<ComentarioTareaService>>();
            
            // Crear el servicio con las dependencias mockeadas
            _service = new ComentarioTareaService(
                _mockRepository.Object,
                _mapper,
                _mockLogger.Object);
        }

        [Fact]
        public async Task GetAllAsync_DebeRetornarTodosLosComentarios()
        {
            // Arrange
            var comentarios = new List<ComentarioTarea>
            {
                new ComentarioTarea { 
                    Id = 1, 
                    TareaId = 1, 
                    UsuarioId = 1,
                    Contenido = "Comentario 1",
                    FechaCreacion = DateTime.UtcNow,
                    Activo = true
                },
                new ComentarioTarea { 
                    Id = 2, 
                    TareaId = 1, 
                    UsuarioId = 2,
                    Contenido = "Comentario 2",
                    FechaCreacion = DateTime.UtcNow,
                    Activo = true
                }
            };

            _mockRepository.Setup(repo => repo.GetAllActiveAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(comentarios);

            // Act
            var result = await _service.GetAllAsync();

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count());
            Assert.Contains(result, dto => dto.Contenido == "Comentario 1");
            Assert.Contains(result, dto => dto.Contenido == "Comentario 2");
        }

        [Fact]
        public async Task GetByIdAsync_ConIdExistente_DebeRetornarComentario()
        {
            // Arrange
            var comentario = new ComentarioTarea 
            { 
                Id = 1, 
                TareaId = 1, 
                UsuarioId = 1,
                Contenido = "Comentario Test",
                FechaCreacion = DateTime.UtcNow,
                Activo = true
            };

            _mockRepository.Setup(repo => repo.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(comentario);

            // Act
            var result = await _service.GetByIdAsync(1);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(1, result.Id);
            Assert.Equal("Comentario Test", result.Contenido);
            Assert.Equal(1, result.TareaId);
        }

        [Fact]
        public async Task GetByIdAsync_ConIdInexistente_DebeRetornarNull()
        {
            // Arrange
            _mockRepository.Setup(repo => repo.GetByIdAsync(999, It.IsAny<CancellationToken>()))
                .ReturnsAsync((ComentarioTarea)null);

            // Act
            var result = await _service.GetByIdAsync(999);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task CreateAsync_DebeCrearYRetornarComentario()
        {
            // Arrange
            var createDto = new CreateComentarioTareaDto
            {
                TareaId = 1,
                UsuarioId = 1,
                Contenido = "Nuevo Comentario",
                TieneArchivosAdjuntos = false,
                Activo = true
            };

            var createdEntity = new ComentarioTarea
            {
                Id = 1,
                TareaId = 1,
                UsuarioId = 1,
                Contenido = "Nuevo Comentario",
                TieneArchivosAdjuntos = false,
                Activo = true,
                FechaCreacion = DateTime.UtcNow
            };

            _mockRepository.Setup(repo => repo.AddAsync(It.IsAny<ComentarioTarea>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(createdEntity);

            // Act
            var result = await _service.CreateAsync(createDto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(1, result.Id);
            Assert.Equal("Nuevo Comentario", result.Contenido);
            Assert.Equal(1, result.TareaId);
        }

        [Fact]
        public async Task UpdateAsync_ConIdExistente_DebeActualizarYRetornarTrue()
        {
            // Arrange
            var updateDto = new UpdateComentarioTareaDto
            {
                Id = 1,
                Contenido = "Comentario Actualizado",
                TieneArchivosAdjuntos = true,
                Activo = true
            };

            var existingEntity = new ComentarioTarea
            {
                Id = 1,
                TareaId = 1,
                UsuarioId = 1,
                Contenido = "Comentario Original",
                TieneArchivosAdjuntos = false,
                Activo = true,
                FechaCreacion = DateTime.UtcNow.AddDays(-10)
            };

            _mockRepository.Setup(repo => repo.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(existingEntity);

            // Act
            var result = await _service.UpdateAsync(updateDto);

            // Assert
            Assert.True(result);
            _mockRepository.Verify(repo => repo.UpdateAsync(It.Is<ComentarioTarea>(e => 
                e.Id == 1 && 
                e.Contenido == "Comentario Actualizado" && 
                e.TieneArchivosAdjuntos == true), It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task UpdateAsync_ConIdInexistente_DebeRetornarFalse()
        {
            // Arrange
            var updateDto = new UpdateComentarioTareaDto
            {
                Id = 999,
                Contenido = "Comentario Actualizado",
                TieneArchivosAdjuntos = true,
                Activo = true
            };

            _mockRepository.Setup(repo => repo.GetByIdAsync(999, It.IsAny<CancellationToken>()))
                .ReturnsAsync((ComentarioTarea)null);

            // Act
            var result = await _service.UpdateAsync(updateDto);

            // Assert
            Assert.False(result);
            _mockRepository.Verify(repo => repo.UpdateAsync(It.IsAny<ComentarioTarea>(), It.IsAny<CancellationToken>()), Times.Never);
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
