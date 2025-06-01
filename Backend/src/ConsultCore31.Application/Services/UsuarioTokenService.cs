using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using ConsultCore31.Application.DTOs.UsuarioToken;
using ConsultCore31.Application.Interfaces;
using ConsultCore31.Core.Entities;
using ConsultCore31.Core.Interfaces;
using Microsoft.Extensions.Logging;

namespace ConsultCore31.Application.Services
{
    /// <summary>
    /// Implementación del servicio para la gestión de tokens de usuario
    /// </summary>
    public class UsuarioTokenService : IUsuarioTokenService
    {
        private readonly IUsuarioTokenRepository _usuarioTokenRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<UsuarioTokenService> _logger;

        public UsuarioTokenService(
            IUsuarioTokenRepository usuarioTokenRepository,
            IMapper mapper,
            ILogger<UsuarioTokenService> logger)
        {
            _usuarioTokenRepository = usuarioTokenRepository ?? throw new ArgumentNullException(nameof(usuarioTokenRepository));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<UsuarioTokenDto> CreateTokenAsync(CreateUsuarioTokenDto createDto)
        {
            try
            {
                var token = _mapper.Map<UsuarioToken>(createDto);
                var tokenCreado = await _usuarioTokenRepository.AddAsync(token);
                return _mapper.Map<UsuarioTokenDto>(tokenCreado);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear el token de usuario");
                throw;
            }
        }

        public async Task<UsuarioTokenDto> GetTokenAsync(Guid token)
        {
            try
            {
                var usuarioToken = await _usuarioTokenRepository.GetByTokenAsync(token);
                return usuarioToken != null ? _mapper.Map<UsuarioTokenDto>(usuarioToken) : null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al obtener el token: {token}");
                throw;
            }
        }

        /// <summary>
        /// Obtiene todos los tokens activos para un usuario
        /// </summary>
        public async Task<IEnumerable<UsuarioTokenDto>> GetActiveTokensByUsuarioIdAsync(int usuarioId)
        {
            if (usuarioId <= 0)
                throw new ArgumentException("El ID de usuario debe ser mayor que cero.", nameof(usuarioId));

            try
            {
                _logger.LogInformation($"Obteniendo tokens activos para el usuario: {usuarioId}");
                var tokens = await _usuarioTokenRepository.GetActiveTokensByUsuarioIdAsync(usuarioId);
                return _mapper.Map<IEnumerable<UsuarioTokenDto>>(tokens);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al obtener los tokens activos para el usuario: {usuarioId}");
                throw;
            }
        }

        /// <inheritdoc />
        public async Task InvalidateUserTokensAsync(int usuarioId, string ipAddress, string? motivo = null)
        {
            if (usuarioId <= 0)
                throw new ArgumentException("El ID de usuario debe ser mayor que cero.", nameof(usuarioId));

            if (string.IsNullOrEmpty(ipAddress))
                throw new ArgumentException("La dirección IP no puede estar vacía.", nameof(ipAddress));

            try
            {
                _logger.LogInformation($"Invalidando todos los tokens del usuario {usuarioId} desde {ipAddress}. Motivo: {motivo ?? "No especificado"}");
                await _usuarioTokenRepository.InvalidateUserTokensAsync(usuarioId, ipAddress, motivo);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al invalidar los tokens del usuario: {usuarioId}");
                throw;
            }
        }

        public async Task MarkAsUsedAsync(Guid token, string ipAddress, string? motivo = null)
        {
            if (string.IsNullOrEmpty(ipAddress))
                throw new ArgumentException("La dirección IP no puede estar vacía.", nameof(ipAddress));

            try
            {
                _logger.LogInformation($"Marcando token {token} como usado desde {ipAddress}. Motivo: {motivo ?? "No especificado"}");
                await _usuarioTokenRepository.MarkAsUsedAsync(token, ipAddress, motivo);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al marcar el token como usado: {token}");
                throw;
            }
        }

        public async Task<TokenValidationResultDto> ValidateTokenAsync(Guid token)
        {
            try
            {
                var usuarioToken = await _usuarioTokenRepository.GetByTokenAsync(token);
                
                if (usuarioToken == null)
                {
                    return new TokenValidationResultDto
                    {
                        IsValid = false,
                        Message = "Token no encontrado"
                    };
                }

                if (usuarioToken.TokenUsado)
                {
                    return new TokenValidationResultDto
                    {
                        IsValid = false,
                        Message = "El token ya ha sido utilizado"
                    };
                }

                if (usuarioToken.FechaExpiracion < DateTime.UtcNow)
                {
                    return new TokenValidationResultDto
                    {
                        IsValid = false,
                        Message = "El token ha expirado"
                    };
                }

                return new TokenValidationResultDto
                {
                    IsValid = true,
                    Message = "Token válido",
                    Token = _mapper.Map<UsuarioTokenDto>(usuarioToken)
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al validar el token: {token}");
                return new TokenValidationResultDto
                {
                    IsValid = false,
                    Message = "Error al validar el token"
                };
            }
        }

        public async Task<int> RemoveExpiredTokensAsync()
        {
            try
            {
                _logger.LogInformation("Iniciando eliminación de tokens expirados");
                var count = await _usuarioTokenRepository.RemoveExpiredTokensAsync();
                _logger.LogInformation("Se eliminaron {Count} tokens expirados", count);
                return count;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar tokens expirados");
                throw new ApplicationException("Ocurrió un error al intentar eliminar los tokens expirados. Por favor, intente nuevamente.", ex);
            }
        }
    }
}
