using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using ConsultCore31.Application.DTOs.CategoriaGasto;
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
    /// Pruebas unitarias para el servicio de categorías de gasto
    /// </summary>
    public class CategoriaGastoServiceTests
    {
        private readonly Mock<ICategoriaGastoRepository> _mockRepository;
        private readonly IMapper _mapper;
        private readonly Mock<ILogger<CategoriaGastoService>> _mockLogger;
        private readonly CategoriaGastoService _service;

        public CategoriaGastoServiceTests()
        {
            _mockRepository = new Mock<ICategoriaGastoRepository>();
            
            // Configurar AutoMapper
            var mapperConfig = new MapperConfiguration(cfg =>
            {
                cfg.AddProfile<CategoriaGastoProfile>();
            });
            _mapper = mapperConfig.CreateMapper();
            
            _mockLogger = new Mock<ILogger<CategoriaGastoService>>();
            
            // Crear el servicio con las dependencias mockeadas
            _service = new CategoriaGastoService(
                _mockRepository.Object,
                _mapper,
                _mockLogger.Object);
        }

        [Fact]
        public async Task GetAllAsync_DebeRetornarTodasLasCategorias()
        {
            // Arrange
            var categorias = new List<CategoriaGasto>
            {
                new CategoriaGasto { Id = 1, Nombre = "Transporte", Descripcion = "Gastos de transporte", FechaCreacion = DateTime.UtcNow },
                new CategoriaGasto { Id = 2, Nombre = "Alimentación", Descripcion = "Gastos de alimentación", FechaCreacion = DateTime.UtcNow }
            };

            _mockRepository.Setup(repo => repo.GetAllActiveAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(categorias);

            // Act
            var result = await _service.GetAllAsync();

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count());
            Assert.Contains(result, dto => dto.Nombre == "Transporte");
            Assert.Contains(result, dto => dto.Nombre == "Alimentación");
        }

        [Fact]
        public async Task GetByIdAsync_ConIdExistente_DebeRetornarCategoria()
        {
            // Arrange
            var categoria = new CategoriaGasto 
            { 
                Id = 1, 
                Nombre = "Transporte", 
                Descripcion = "Gastos de transporte", 
                FechaCreacion = DateTime.UtcNow 
            };

            _mockRepository.Setup(repo => repo.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(categoria);

            // Act
            var result = await _service.GetByIdAsync(1);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(1, result.Id);
            Assert.Equal("Transporte", result.Nombre);
            Assert.Equal("Gastos de transporte", result.Descripcion);
        }

        [Fact]
        public async Task GetByIdAsync_ConIdInexistente_DebeRetornarNull()
        {
            // Arrange
            _mockRepository.Setup(repo => repo.GetByIdAsync(999, It.IsAny<CancellationToken>()))
                .ReturnsAsync((CategoriaGasto)null);

            // Act
            var result = await _service.GetByIdAsync(999);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task CreateAsync_DebeCrearYRetornarCategoria()
        {
            // Arrange
            var createDto = new CreateCategoriaGastoDto
            {
                Nombre = "Nueva Categoría",
                Descripcion = "Descripción de la nueva categoría",
                EsEstandar = true,
                RequiereComprobante = true,
                Activa = true
            };

            var createdEntity = new CategoriaGasto
            {
                Id = 1,
                Nombre = "Nueva Categoría",
                Descripcion = "Descripción de la nueva categoría",
                EsEstandar = true,
                RequiereComprobante = true,
                Activa = true,
                FechaCreacion = DateTime.UtcNow
            };

            _mockRepository.Setup(repo => repo.AddAsync(It.IsAny<CategoriaGasto>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(createdEntity);

            // Act
            var result = await _service.CreateAsync(createDto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(1, result.Id);
            Assert.Equal("Nueva Categoría", result.Nombre);
            Assert.Equal("Descripción de la nueva categoría", result.Descripcion);
            Assert.True(result.EsEstandar);
            Assert.True(result.RequiereComprobante);
            Assert.True(result.Activa);
        }

        [Fact]
        public async Task UpdateAsync_ConIdExistente_DebeActualizarYRetornarTrue()
        {
            // Arrange
            var updateDto = new UpdateCategoriaGastoDto
            {
                Id = 1,
                Nombre = "Categoría Actualizada",
                Descripcion = "Descripción actualizada",
                EsEstandar = false,
                RequiereComprobante = false,
                Activa = true
            };

            var existingEntity = new CategoriaGasto
            {
                Id = 1,
                Nombre = "Categoría Original",
                Descripcion = "Descripción original",
                EsEstandar = true,
                RequiereComprobante = true,
                Activa = true,
                FechaCreacion = DateTime.UtcNow
            };

            _mockRepository.Setup(repo => repo.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(existingEntity);

            // Act
            var result = await _service.UpdateAsync(updateDto);

            // Assert
            Assert.True(result);
            _mockRepository.Verify(repo => repo.UpdateAsync(It.Is<CategoriaGasto>(c => 
                c.Id == 1 && 
                c.Nombre == "Categoría Actualizada" && 
                c.Descripcion == "Descripción actualizada" && 
                !c.EsEstandar && 
                !c.RequiereComprobante && 
                c.Activa), It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task UpdateAsync_ConIdInexistente_DebeRetornarFalse()
        {
            // Arrange
            var updateDto = new UpdateCategoriaGastoDto
            {
                Id = 999,
                Nombre = "Categoría Actualizada",
                Descripcion = "Descripción actualizada",
                EsEstandar = false,
                RequiereComprobante = false,
                Activa = true
            };

            _mockRepository.Setup(repo => repo.GetByIdAsync(999, It.IsAny<CancellationToken>()))
                .ReturnsAsync((CategoriaGasto)null);

            // Act
            var result = await _service.UpdateAsync(updateDto);

            // Assert
            Assert.False(result);
            _mockRepository.Verify(repo => repo.UpdateAsync(It.IsAny<CategoriaGasto>(), It.IsAny<CancellationToken>()), Times.Never);
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
