using AutoMapper;

using ConsultCore31.Application.DTOs.Empleado;
using ConsultCore31.Application.Mappings;
using ConsultCore31.Application.Services;
using ConsultCore31.Core.Entities;
using ConsultCore31.Core.Interfaces;

using Microsoft.Extensions.Logging;

using Moq;

namespace ConsultCore31.Tests.Services
{
    /// <summary>
    /// Pruebas unitarias para el servicio de empleados
    /// </summary>
    public class EmpleadoServiceTests
    {
        private readonly Mock<IEmpleadoRepository> _mockRepository;
        private readonly IMapper _mapper;
        private readonly Mock<ILogger<EmpleadoService>> _mockLogger;
        private readonly EmpleadoService _service;

        public EmpleadoServiceTests()
        {
            _mockRepository = new Mock<IEmpleadoRepository>();

            // Configurar AutoMapper
            var mapperConfig = new MapperConfiguration(cfg =>
            {
                cfg.AddProfile<EmpleadoProfile>();
            });
            _mapper = mapperConfig.CreateMapper();

            _mockLogger = new Mock<ILogger<EmpleadoService>>();

            // Crear el servicio con las dependencias mockeadas
            _service = new EmpleadoService(
                _mockRepository.Object,
                _mapper,
                _mockLogger.Object);
        }

        [Fact]
        public async Task GetAllAsync_DebeRetornarTodosLosEmpleados()
        {
            // Arrange
            var empleados = new List<Empleado>
            {
                new Empleado {
                    Id = 1,
                    Nombre = "Juan",
                    Apellidos = "Pérez",
                    Email = "juan.perez@example.com",
                    Telefono = "1234567890",
                    Movil = "0987654321",
                    FechaCreacion = DateTime.UtcNow
                },
                new Empleado {
                    Id = 2,
                    Nombre = "María",
                    Apellidos = "González",
                    Email = "maria.gonzalez@example.com",
                    Telefono = "1234567891",
                    Movil = "0987654322",
                    FechaCreacion = DateTime.UtcNow
                }
            };

            _mockRepository.Setup(repo => repo.GetAllActiveAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(empleados);

            // Act
            var result = await _service.GetAllAsync();

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count());
            Assert.Contains(result, dto => dto.Nombre == "Juan" && dto.Apellidos == "Pérez");
            Assert.Contains(result, dto => dto.Nombre == "María" && dto.Apellidos == "González");
        }

        [Fact]
        public async Task GetByIdAsync_ConIdExistente_DebeRetornarEmpleado()
        {
            // Arrange
            var empleado = new Empleado
            {
                Id = 1,
                Nombre = "Juan",
                Apellidos = "Pérez",
                Email = "juan.perez@example.com",
                Telefono = "1234567890",
                Movil = "0987654321",
                FechaCreacion = DateTime.UtcNow
            };

            _mockRepository.Setup(repo => repo.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(empleado);

            // Act
            var result = await _service.GetByIdAsync(1, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(1, result.Id);
            Assert.Equal("Juan", result.Nombre);
            Assert.Equal("Pérez", result.Apellidos);
            Assert.Equal("juan.perez@example.com", result.Email);
        }

        [Fact]
        public async Task GetByIdAsync_ConIdInexistente_DebeRetornarNull()
        {
            // Arrange
            _mockRepository.Setup(repo => repo.GetByIdAsync(999, It.IsAny<CancellationToken>()))
                .ReturnsAsync((Empleado)null);

            // Act
            var result = await _service.GetByIdAsync(999, CancellationToken.None);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task CreateAsync_DebeCrearYRetornarEmpleado()
        {
            // Arrange
            var createDto = new CreateEmpleadoDto
            {
                Nombre = "Nuevo",
                Apellidos = "Empleado",
                Email = "nuevo.empleado@example.com",
                Telefono = "1234567890",
                Movil = "0987654321",
                Activo = true,
                Genero = 1
            };

            var createdEntity = new Empleado
            {
                Id = 1,
                Nombre = "Nuevo",
                Apellidos = "Empleado",
                Email = "nuevo.empleado@example.com",
                Telefono = "1234567890",
                Movil = "0987654321",
                Activo = true,
                Genero = 1,
                FechaCreacion = DateTime.UtcNow
            };

            _mockRepository.Setup(repo => repo.AddAsync(It.IsAny<Empleado>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(createdEntity);

            // Act
            var result = await _service.CreateAsync(createDto, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(1, result.Id);
            Assert.Equal("Nuevo", result.Nombre);
            Assert.Equal("Empleado", result.Apellidos);
            Assert.Equal("nuevo.empleado@example.com", result.Email);
            Assert.Equal("1234567890", result.Telefono);
            Assert.Equal("0987654321", result.Movil);
            Assert.True(result.Activo);
            Assert.Equal(1, result.Genero);
        }

        [Fact]
        public async Task UpdateAsync_ConIdExistente_DebeActualizarYRetornarTrue()
        {
            // Arrange
            var updateDto = new UpdateEmpleadoDto
            {
                Id = 1,
                Nombre = "Empleado",
                Apellidos = "Actualizado",
                Email = "empleado.actualizado@example.com",
                Telefono = "9876543210",
                Movil = "0123456789",
                Activo = true,
                Genero = 2
            };

            var existingEntity = new Empleado
            {
                Id = 1,
                Nombre = "Empleado",
                Apellidos = "Original",
                Email = "empleado.original@example.com",
                Telefono = "1234567890",
                Movil = "0987654321",
                Activo = true,
                Genero = 1,
                FechaCreacion = DateTime.UtcNow
            };

            _mockRepository.Setup(repo => repo.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(existingEntity);

            // Act
            var result = await _service.UpdateAsync(updateDto, CancellationToken.None);

            // Assert
            Assert.True(result);
            _mockRepository.Verify(repo => repo.UpdateAsync(It.Is<Empleado>(e =>
                e.Id == 1 &&
                e.Nombre == "Empleado" &&
                e.Apellidos == "Actualizado" &&
                e.Email == "empleado.actualizado@example.com" &&
                e.Telefono == "9876543210" &&
                e.Movil == "0123456789" &&
                e.Activo &&
                e.Genero == 2), It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task UpdateAsync_ConIdInexistente_DebeRetornarFalse()
        {
            // Arrange
            var updateDto = new UpdateEmpleadoDto
            {
                Id = 999,
                Nombre = "Empleado",
                Apellidos = "Actualizado",
                Email = "empleado.actualizado@example.com",
                Telefono = "9876543210",
                Movil = "0123456789",
                Activo = true,
                Genero = 2
            };

            _mockRepository.Setup(repo => repo.GetByIdAsync(999, It.IsAny<CancellationToken>()))
                .ReturnsAsync((Empleado)null);

            // Act
            var result = await _service.UpdateAsync(updateDto, CancellationToken.None);

            // Assert
            Assert.False(result);
            _mockRepository.Verify(repo => repo.UpdateAsync(It.IsAny<Empleado>(), It.IsAny<CancellationToken>()), Times.Never);
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