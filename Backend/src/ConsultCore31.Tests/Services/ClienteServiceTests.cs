using AutoMapper;

using ConsultCore31.Application.DTOs.Cliente;
using ConsultCore31.Application.Mappings;
using ConsultCore31.Application.Services;
using ConsultCore31.Core.Entities;
using ConsultCore31.Core.Interfaces;

using Microsoft.Extensions.Logging;

using Moq;

namespace ConsultCore31.Tests.Services
{
    /// <summary>
    /// Pruebas unitarias para el servicio de clientes
    /// </summary>
    public class ClienteServiceTests
    {
        private readonly Mock<IClienteRepository> _mockRepository;
        private readonly IMapper _mapper;
        private readonly Mock<ILogger<ClienteService>> _mockLogger;
        private readonly ClienteService _service;

        public ClienteServiceTests()
        {
            _mockRepository = new Mock<IClienteRepository>();

            // Configurar AutoMapper
            var mapperConfig = new MapperConfiguration(cfg =>
            {
                cfg.AddProfile<ClienteProfile>();
            });
            _mapper = mapperConfig.CreateMapper();

            _mockLogger = new Mock<ILogger<ClienteService>>();

            // Crear el servicio con las dependencias mockeadas
            _service = new ClienteService(
                _mockRepository.Object,
                _mapper,
                _mockLogger.Object);
        }

        [Fact]
        public async Task GetAllAsync_DebeRetornarTodosLosClientes()
        {
            // Arrange
            var clientes = new List<Cliente>
            {
                new Cliente { Id = 1, Nombre = "Cliente 1", Email = "cliente1@example.com", FechaCreacion = DateTime.UtcNow },
                new Cliente { Id = 2, Nombre = "Cliente 2", Email = "cliente2@example.com", FechaCreacion = DateTime.UtcNow }
            };

            _mockRepository.Setup(repo => repo.GetAllActiveAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(clientes);

            // Act
            var result = await _service.GetAllAsync();

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count());
            Assert.Contains(result, dto => dto.Nombre == "Cliente 1");
            Assert.Contains(result, dto => dto.Nombre == "Cliente 2");
        }

        [Fact]
        public async Task GetByIdAsync_ConIdExistente_DebeRetornarCliente()
        {
            // Arrange
            var cliente = new Cliente
            {
                Id = 1,
                Nombre = "Cliente Test",
                Email = "cliente@example.com",
                FechaCreacion = DateTime.UtcNow
            };

            _mockRepository.Setup(repo => repo.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(cliente);

            // Act
            var result = await _service.GetByIdAsync(1, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(1, result.Id);
            Assert.Equal("Cliente Test", result.Nombre);
            Assert.Equal("cliente@example.com", result.Email);
        }

        [Fact]
        public async Task GetByIdAsync_ConIdInexistente_DebeRetornarNull()
        {
            // Arrange
            _mockRepository.Setup(repo => repo.GetByIdAsync(999, It.IsAny<CancellationToken>()))
                .ReturnsAsync((Cliente)null);

            // Act
            var result = await _service.GetByIdAsync(999, CancellationToken.None);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task CreateAsync_DebeCrearYRetornarCliente()
        {
            // Arrange
            var createDto = new CreateClienteDto
            {
                Nombre = "Nuevo Cliente",
                Email = "nuevo@example.com",
                Telefono = "1234567890",
                Activo = true
            };

            var createdEntity = new Cliente
            {
                Id = 1,
                Nombre = "Nuevo Cliente",
                Email = "nuevo@example.com",
                Telefono = "1234567890",
                Activo = true,
                FechaCreacion = DateTime.UtcNow
            };

            _mockRepository.Setup(repo => repo.AddAsync(It.IsAny<Cliente>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(createdEntity);

            // Act
            var result = await _service.CreateAsync(createDto, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(1, result.Id);
            Assert.Equal("Nuevo Cliente", result.Nombre);
            Assert.Equal("nuevo@example.com", result.Email);
            Assert.Equal("1234567890", result.Telefono);
            Assert.True(result.Activo);
        }

        [Fact]
        public async Task UpdateAsync_ConIdExistente_DebeActualizarYRetornarTrue()
        {
            // Arrange
            var updateDto = new UpdateClienteDto
            {
                Id = 1,
                Nombre = "Cliente Actualizado",
                Email = "actualizado@example.com",
                Telefono = "9876543210",
                Activo = true
            };

            var existingEntity = new Cliente
            {
                Id = 1,
                Nombre = "Cliente Original",
                Email = "original@example.com",
                Telefono = "1234567890",
                Activo = true,
                FechaCreacion = DateTime.UtcNow
            };

            _mockRepository.Setup(repo => repo.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(existingEntity);

            // Act
            var result = await _service.UpdateAsync(updateDto, CancellationToken.None);

            // Assert
            Assert.True(result);
            _mockRepository.Verify(repo => repo.UpdateAsync(It.Is<Cliente>(c =>
                c.Id == 1 &&
                c.Nombre == "Cliente Actualizado" &&
                c.Email == "actualizado@example.com" &&
                c.Telefono == "9876543210" &&
                c.Activo), It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task UpdateAsync_ConIdInexistente_DebeRetornarFalse()
        {
            // Arrange
            var updateDto = new UpdateClienteDto
            {
                Id = 999,
                Nombre = "Cliente Actualizado",
                Email = "actualizado@example.com",
                Telefono = "9876543210",
                Activo = true
            };

            _mockRepository.Setup(repo => repo.GetByIdAsync(999, It.IsAny<CancellationToken>()))
                .ReturnsAsync((Cliente)null);

            // Act
            var result = await _service.UpdateAsync(updateDto, CancellationToken.None);

            // Assert
            Assert.False(result);
            _mockRepository.Verify(repo => repo.UpdateAsync(It.IsAny<Cliente>(), It.IsAny<CancellationToken>()), Times.Never);
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