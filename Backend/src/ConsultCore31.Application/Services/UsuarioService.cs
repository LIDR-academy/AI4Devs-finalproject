using AutoMapper;

using ConsultCore31.Application.DTOs.Usuario;
using ConsultCore31.Application.Interfaces;
using ConsultCore31.Core.Entities;
using ConsultCore31.Core.Interfaces;

using Microsoft.Extensions.Logging;

using System.Security.Cryptography;

namespace ConsultCore31.Application.Services
{
    /// <summary>
    /// Implementación del servicio de Usuario
    /// </summary>
    public class UsuarioService : IUsuarioService
    {
        private readonly IUsuarioRepository _usuarioRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<UsuarioService> _logger;

        public UsuarioService(
            IUsuarioRepository usuarioRepository,
            IMapper mapper,
            ILogger<UsuarioService> logger)
        {
            _usuarioRepository = usuarioRepository ?? throw new ArgumentNullException(nameof(usuarioRepository));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<IEnumerable<UsuarioDto>> GetAllUsuariosAsync()
        {
            try
            {
                var usuarios = await _usuarioRepository.ListAllAsync();
                return _mapper.Map<IEnumerable<UsuarioDto>>(usuarios);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener todos los usuarios");
                throw;
            }
        }

        public async Task<UsuarioDto> GetUsuarioByIdAsync(int id)
        {
            try
            {
                var usuario = await _usuarioRepository.GetByIdAsync(id);
                return _mapper.Map<UsuarioDto>(usuario);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al obtener el usuario con ID: {id}");
                throw;
            }
        }

        public async Task<UsuarioDto> CreateUsuarioAsync(CreateUsuarioDto createUsuarioDto)
        {
            try
            {
                if (createUsuarioDto == null)
                    throw new ArgumentNullException(nameof(createUsuarioDto), "El DTO de creación de usuario no puede ser nulo.");

                // Validar que no exista un usuario con el mismo correo
                if (await _usuarioRepository.ExistsByEmailAsync(createUsuarioDto.Email))
                {
                    throw new InvalidOperationException("Ya existe un usuario con el correo electrónico proporcionado.");
                }

                var usuario = _mapper.Map<Usuario>(createUsuarioDto);

                if (string.IsNullOrWhiteSpace(createUsuarioDto.Password))
                {
                    throw new ArgumentException("La contraseña es requerida.", nameof(createUsuarioDto.Password));
                }

                // Generar sal aleatoria
                var salt = GenerateSalt();

                // Generar hash seguro de la contraseña con la sal
                var passwordHash = GenerateHash(createUsuarioDto.Password, salt);

                // Almacenar el hash en la contraseña y la sal en el campo de recuperación
                usuario.SetPassword(passwordHash);
                usuario.UsuarioContrasenaRecuperacion = Convert.ToBase64String(salt);
                usuario.UsuarioActivo = true; // Por defecto, el usuario se crea activo

                var usuarioCreado = await _usuarioRepository.AddAsync(usuario);
                return _mapper.Map<UsuarioDto>(usuarioCreado);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear el usuario");
                throw;
            }
        }

        public async Task<bool> UpdateUsuarioAsync(UpdateUsuarioDto updateUsuarioDto)
        {
            try
            {
                // Validar que el usuario exista
                var usuarioExistente = await _usuarioRepository.GetByIdAsync(updateUsuarioDto.Id);
                if (usuarioExistente == null)
                {
                    return false;
                }

                // Validar que no exista otro usuario con el mismo correo
                if (await ExistsByEmailWithIntIdAsync(updateUsuarioDto.Email, updateUsuarioDto.Id))
                {
                    throw new InvalidOperationException("Ya existe otro usuario con el correo electrónico proporcionado.");
                }

                // Mapear las propiedades actualizables
                usuarioExistente.UserName = updateUsuarioDto.Nombre;
                usuarioExistente.UsuarioApellidos = updateUsuarioDto.Apellidos;
                usuarioExistente.Email = updateUsuarioDto.Email;
                usuarioExistente.PhoneNumber = updateUsuarioDto.Movil;
                usuarioExistente.PerfilId = updateUsuarioDto.PerfilId;
                usuarioExistente.EmpleadoId = updateUsuarioDto.EmpleadoId;
                usuarioExistente.ObjetoId = updateUsuarioDto.ObjetoId;
                usuarioExistente.UsuarioActivo = updateUsuarioDto.Activo;

                await _usuarioRepository.UpdateAsync(usuarioExistente);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al actualizar el usuario con ID: {updateUsuarioDto?.Id}");
                throw;
            }
        }

        public async Task<bool> DeleteUsuarioAsync(int id)
        {
            try
            {
                var usuario = await _usuarioRepository.GetByIdAsync(id);
                if (usuario == null)
                {
                    _logger.LogWarning("Intento de eliminar un usuario que no existe. ID: {UsuarioId}", id);
                    return false;
                }

                // Implementación de eliminación lógica en lugar de física
                if (usuario.UsuarioActivo)
                {
                    usuario.UsuarioActivo = false;
                    await _usuarioRepository.UpdateAsync(usuario);
                    _logger.LogInformation("Usuario desactivado (eliminación lógica). ID: {UsuarioId}", id);
                }

                // Si se requiere eliminación física, descomentar la siguiente línea
                // await _usuarioRepository.DeleteAsync(usuario);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al eliminar el usuario con ID: {id}");
                throw;
            }
        }

        public async Task<bool> ExistsByEmailAsync(string email, int? excludeId = null)
        {
            return await _usuarioRepository.ExistsByEmailAsync(email, excludeId?.ToString());
        }

        public async Task<bool> ExistsByEmailWithIntIdAsync(string email, int? excludeId = null)
        {
            return await ExistsByEmailAsync(email, excludeId);
        }

        /// <summary>
        /// Genera una sal aleatoria segura.
        /// </summary>
        /// <returns>Array de bytes con la sal generada.</returns>
        private static byte[] GenerateSalt()
        {
            byte[] salt = new byte[16]; // 128 bits de sal
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(salt);
            return salt;
        }

        /// <summary>
        /// Genera un hash seguro de la contraseña usando PBKDF2 con SHA-256.
        /// </summary>
        /// <param name="password">Contraseña en texto plano.</param>
        /// <param name="salt">Sal a utilizar para el hash.</param>
        /// <returns>Array de bytes con el hash generado.</returns>
        private static byte[] GenerateHash(string password, byte[] salt)
        {
            const int iterations = 10000; // Número de iteraciones (ajustar según necesidades)
            const int hashSize = 32; // Tamaño del hash en bytes (256 bits)

            using var pbkdf2 = new Rfc2898DeriveBytes(
                password: password,
                salt: salt,
                iterations: iterations,
                hashAlgorithm: HashAlgorithmName.SHA256
            );

            return pbkdf2.GetBytes(hashSize);
        }

        /// <summary>
        /// Verifica si una contraseña coincide con el hash almacenado.
        /// </summary>
        /// <param name="storedHash">Hash almacenado.</param>
        /// <param name="storedSalt">Sal almacenada.</param>
        /// <param name="providedPassword">Contraseña a verificar.</param>
        /// <returns>True si la contraseña es correcta, false en caso contrario.</returns>
        public bool VerifyPassword(byte[] storedHash, string storedSalt, string providedPassword)
        {
            if (string.IsNullOrEmpty(providedPassword) || storedHash == null || string.IsNullOrEmpty(storedSalt))
                return false;

            try
            {
                var salt = Convert.FromBase64String(storedSalt);
                var hashToVerify = GenerateHash(providedPassword, salt);
                return hashToVerify.SequenceEqual(storedHash);
            }
            catch (FormatException)
            {
                return false; // Formato de sal inválido
            }
        }
    }
}