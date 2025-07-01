using AutoMapper;

using ConsultCore31.Application.Interfaces;
using ConsultCore31.Core.Entities;
using ConsultCore31.Core.Entities.Seguridad;
using ConsultCore31.Infrastructure.Persistence.Context;
using ConsultCore31.WebAPI.Configurations;
using ConsultCore31.WebAPI.DTOs.Auth;
using ConsultCore31.WebAPI.Services.Interfaces;

using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace ConsultCore31.WebAPI.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly JwtSettings _jwtSettings;
    private readonly ILogger<AuthService> _logger;
    private readonly IMapper _mapper;
    private readonly IPerfilService _perfilService;
    private readonly SignInManager<Usuario> _signInManager;
    private readonly ITokenService _tokenService;
    private readonly UserManager<Usuario> _userManager;

    public AuthService(
        UserManager<Usuario> userManager,
        SignInManager<Usuario> signInManager,
        ITokenService tokenService,
        IOptions<JwtSettings> jwtSettings,
        AppDbContext context,
        IMapper mapper,
        ILogger<AuthService> logger,
        IPerfilService perfilService)
    {
        _userManager = userManager ?? throw new ArgumentNullException(nameof(userManager));
        _signInManager = signInManager ?? throw new ArgumentNullException(nameof(signInManager));
        _tokenService = tokenService ?? throw new ArgumentNullException(nameof(tokenService));
        _jwtSettings = jwtSettings?.Value ?? throw new ArgumentNullException(nameof(jwtSettings));
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _perfilService = perfilService ?? throw new ArgumentNullException(nameof(perfilService));
    }

    public async Task<bool> ConfirmEmailAsync(string userId, string token)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            throw new ApplicationException("Usuario no encontrado");
        }

        var result = await _userManager.ConfirmEmailAsync(user, token);
        return result.Succeeded;
    }

    public async Task<bool> ForgotPasswordAsync(string email, string origin)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            throw new ArgumentException("El correo electrónico no puede estar vacío", nameof(email));
        }

        var user = await _userManager.FindByEmailAsync(email);
        if (user == null)
        {
            // No revelar que el usuario no existe
            _logger.LogInformation("Se solicitó restablecer contraseña para un correo no registrado: {Email}", email);
            return true;
        }

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        _logger.LogInformation("Token de restablecimiento generado para el usuario: {UserId}", user.Id);

        // Aquí podrías enviar un correo con el token
        // await SendPasswordResetEmail(user, origin, token);

        return true;
    }

    public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request, string ipAddress)
    {
        var user = await _userManager.FindByEmailAsync(request.UsernameOrEmail) ??
                  await _userManager.FindByNameAsync(request.UsernameOrEmail);

        if (user == null)
        {
            throw new ApplicationException("Usuario o contraseña incorrectos");
        }

        var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password, false);

        if (!result.Succeeded)
        {
            throw new ApplicationException("Usuario o contraseña incorrectos");
        }

        // Generar tokens
        var token = await GenerateJwtToken(user);
        var refreshToken = GenerateRefreshToken(ipAddress);

        // Guardar el refresh token
        user.RefreshTokens ??= new List<RefreshToken>();
        user.RefreshTokens.Add(refreshToken);

        // Eliminar tokens viejos
        RemoveOldRefreshTokens(user);

        await _userManager.UpdateAsync(user);

        var response = new AuthResponseDto
        {
            UserId = user.Id.ToString(),
            FullName = $"{user.UserName} {user.UsuarioApellidos}",
            //Id = user.Id,
            //UserName = user.UserName,
            Email = user.Email,
            // Otras propiedades según sea necesario
            Token = token,
            RefreshToken = refreshToken.Token,
            Expiration = DateTime.UtcNow.AddMinutes(_jwtSettings.TokenExpirationInMinutes)
        };

        // Obtener el perfil y asignar el rol
        var perfil = await _perfilService.GetPerfilByIdAsync(user.PerfilId);
        response.Roles = new List<string> { perfil.Nombre };

        // Mapear a DTO de respuesta
        //var response = _mapper.Map<AuthResponseDto>(user);
        //response.Token = token;
        //response.RefreshToken = refreshToken.Token;
        //response.Expiration = DateTime.UtcNow.AddMinutes(_jwtSettings.TokenExpirationInMinutes);
        //response.Roles = (List<string>)await _userManager.GetRolesAsync(user);

        // Aquí podrías agregar los permisos del usuario
        // response.Permissions = await GetUserPermissionsAsync(user.Id);

        return response;
    }

    public async Task<AuthResponseDto> RefreshTokenAsync(RefreshTokenRequestDto request, string ipAddress)
    {
        if (request == null)
        {
            throw new ArgumentNullException(nameof(request));
        }

        if (string.IsNullOrWhiteSpace(ipAddress))
        {
            throw new ArgumentException("La dirección IP no puede estar vacía", nameof(ipAddress));
        }

        if (string.IsNullOrWhiteSpace(request.Token))
        {
            throw new ArgumentException("El token no puede estar vacío", nameof(request.Token));
        }

        if (string.IsNullOrWhiteSpace(request.RefreshToken))
        {
            throw new ArgumentException("El token de actualización no puede estar vacío", nameof(request.RefreshToken));
        }

        var principal = _tokenService.GetPrincipalFromExpiredToken(request.Token);
        var userId = principal.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(userId, out int userIdInt))
        {
            throw new SecurityTokenException("Formato de ID de usuario inválido");
        }

        var user = await _userManager.Users
            .Include(u => u.RefreshTokens)
            .FirstOrDefaultAsync(u => u.Id == userIdInt);

        if (user == null)
        {
            throw new SecurityTokenException("Usuario no encontrado");
        }

        var refreshToken = user.RefreshTokens.SingleOrDefault(rt => rt.Token == request.RefreshToken);

        if (refreshToken == null)
        {
            throw new SecurityTokenException("Token de actualización no válido");
        }

        if (refreshToken.Revocado)
        {
            // Revocar todos los tokens descendientes en caso de reutilización
            RevokeDescendantRefreshTokens(refreshToken, user, ipAddress, $"Intento de reutilización de token anidado: {request.Token}");
            await _userManager.UpdateAsync(user);
            throw new SecurityTokenException("Token de actualización revocado");
        }

        // Verificar si el token ha expirado
        if (refreshToken.FechaExpiracion <= DateTime.UtcNow)
        {
            throw new SecurityTokenException("Token de actualización expirado");
        }

        // Rotar el token
        var newRefreshToken = RotateRefreshToken(refreshToken, ipAddress);
        user.RefreshTokens.Add(newRefreshToken);

        // Marcar el token anterior como revocado
        refreshToken.Revocado = true;
        refreshToken.FechaRevocacion = DateTime.UtcNow;
        refreshToken.RazonRevocacion = "Reemplazado por nuevo token";
        refreshToken.ReemplazadoPorToken = newRefreshToken.Token;

        // Limpiar tokens viejos
        RemoveOldRefreshTokens(user);

        // Guardar cambios
        await _userManager.UpdateAsync(user);

        // Generar nuevo token JWT
        var token = await GenerateJwtToken(user);

        // Mapear a DTO de respuesta
        var response = _mapper.Map<AuthResponseDto>(user);
        response.Token = token;
        response.RefreshToken = newRefreshToken.Token;
        response.Expiration = DateTime.UtcNow.AddMinutes(_jwtSettings.TokenExpirationInMinutes);
        var roles = await _userManager.GetRolesAsync(user);
        response.Roles = roles.ToList();

        return response;
    }

    public async Task<bool> RegisterAsync(RegisterRequestDto request, string origin)
    {
        if (request == null)
        {
            throw new ArgumentNullException(nameof(request));
        }

        // Validar que el nombre de usuario y correo no estén en uso
        if (await _userManager.FindByNameAsync(request.UserName) != null)
        {
            throw new ApplicationException("El nombre de usuario ya está en uso");
        }

        if (await _userManager.FindByEmailAsync(request.Email) != null)
        {
            throw new ApplicationException("El correo electrónico ya está registrado");
        }

        var user = new Usuario
        {
            UserName = request.UserName,
            Email = request.Email,
            NormalizedUserName = request.FirstName,
            UsuarioApellidos = request.LastName,
            EmailConfirmed = true, // Asumimos que el correo está confirmado al registrarse
            UsuarioActivo = true,
            PhoneNumber = string.Empty // Número de teléfono opcional
        };

        // Configurar el perfil por defecto (podrías querer obtener esto de configuración)
        user.PerfilId = 1; // Asegúrate de que exista un perfil con este ID
        user.ObjetoId = 1; // Asegúrate de que exista un objeto con este ID

        var result = await _userManager.CreateAsync(user, request.Password);

        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new ApplicationException($"Error al crear el usuario: {errors}");
        }

        // Asignar rol por defecto (si lo hay)
        // await _userManager.AddToRoleAsync(user, "User");

        // Aquí podrías enviar un correo de confirmación
        // await SendConfirmationEmail(user, origin);

        return true;
    }

    public async Task<bool> ResetPasswordAsync(ResetPasswordRequestDto request)
    {
        if (request == null)
        {
            throw new ArgumentNullException(nameof(request));
        }

        if (string.IsNullOrWhiteSpace(request.Token))
        {
            throw new ArgumentException("El token no puede estar vacío", nameof(request.Token));
        }

        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
        {
            // No revelar que el usuario no existe
            _logger.LogInformation("Se intentó restablecer contraseña para un correo no registrado: {Email}", request.Email);
            return true;
        }

        var result = await _userManager.ResetPasswordAsync(user, request.Token, request.Password);

        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            _logger.LogError("Error al restablecer la contraseña para el usuario {UserId}: {Errors}", user.Id, errors);
            throw new ApplicationException($"Error al restablecer la contraseña: {errors}");
        }

        _logger.LogInformation("Contraseña restablecida exitosamente para el usuario: {UserId}", user.Id);

        return true;
    }

    public async Task<bool> RevokeTokenAsync(string token, string ipAddress)
    {
        if (string.IsNullOrWhiteSpace(token))
        {
            throw new ArgumentException("El token no puede estar vacío", nameof(token));
        }

        if (string.IsNullOrWhiteSpace(ipAddress))
        {
            throw new ArgumentException("La dirección IP no puede estar vacía", nameof(ipAddress));
        }

        try
        {
            _logger.LogInformation("Iniciando revocación de token para la IP: {IpAddress}", ipAddress);

            // Buscar el usuario que tiene el token de actualización
            var user = await _userManager.Users
                .Include(u => u.RefreshTokens)
                .SingleOrDefaultAsync(u => u.RefreshTokens.Any(t => t.Token == token));

            if (user == null)
            {
                _logger.LogWarning("No se encontró ningún usuario con el token de actualización proporcionado");
                return false;
            }

            var refreshToken = user.RefreshTokens.SingleOrDefault(x => x.Token == token);
            if (refreshToken == null)
            {
                _logger.LogWarning("Token {Token} no encontrado para el usuario {UserId}", token, user.Id);
                return false;
            }

            // Verificar si el token ya está revocado
            if (refreshToken.Revocado)
            {
                _logger.LogWarning("Intento de revocar un token ya revocado para el usuario {UserId}", user.Id);
                return false;
            }

            // Verificar si el token ya expiró
            if (refreshToken.FechaExpiracion <= DateTime.UtcNow)
            {
                _logger.LogWarning("Intento de revocar un token ya expirado para el usuario {UserId}", user.Id);
                return false;
            }

            // Revocar el token
            RevokeRefreshToken(refreshToken, ipAddress, $"Token revocado por el usuario desde la IP: {ipAddress}");

            try
            {
                // Actualizar el usuario para guardar los cambios en el token
                var result = await _userManager.UpdateAsync(user);
                if (!result.Succeeded)
                {
                    var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                    _logger.LogError("Error al actualizar el usuario {UserId} al revocar el token: {Errors}", user.Id, errors);
                    return false;
                }

                _logger.LogInformation("Token revocado exitosamente para el usuario {UserId}", user.Id);
                return true;
            }
            catch (DbUpdateConcurrencyException ex)
            {
                _logger.LogError(ex, "Error de concurrencia al actualizar el usuario {UserId} al revocar el token", user.Id);
                throw new ApplicationException("Ocurrió un error de concurrencia al procesar la solicitud. Por favor, intente nuevamente.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error inesperado al actualizar el usuario {UserId} al revocar el token", user.Id);
                throw new ApplicationException("Ocurrió un error inesperado al procesar la solicitud. Por favor, intente nuevamente.");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error inesperado al revocar el token");
            throw;
        }
    }

    #region Métodos privados

    /// <summary>
    /// Obtiene los datos de un usuario por su ID
    /// </summary>
    /// <param name="userId">ID del usuario</param>
    /// <returns>Datos del usuario</returns>
    public async Task<UserDto> GetUserByIdAsync(string userId)
    {
        try
        {
            // Buscar el usuario por su ID
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                _logger.LogWarning("Usuario no encontrado con ID: {UserId}", userId);
                return null;
            }

            // Lista para almacenar los roles del usuario
            List<string> roles = new List<string>();

            // try
            // {
            //     // Intentar obtener los roles del usuario
            //     roles = (await _userManager.GetRolesAsync(user)).ToList();
            // }
            // catch (Exception roleEx) when (roleEx.Message.Contains("AspNetUserRoles") ||
            //                               roleEx.InnerException?.Message?.Contains("AspNetUserRoles") == true)
            // {
            //     // Si hay un error específico con la tabla AspNetUserRoles, lo manejamos
            //     _logger.LogWarning(roleEx, "Error al obtener roles del usuario {UserId}. Usando rol por defecto.", userId);
            //     // Asignamos un rol por defecto
            //     roles = new List<string> { "User" };
            // }

            // Obtener el perfil del usuario
            var perfil = await _perfilService.GetPerfilByIdAsync(user.PerfilId);

            // Si no hay roles asignados pero hay un perfil, usar el nombre del perfil como rol
            if (!roles.Any() && perfil != null)
            {
                roles = new List<string> { perfil.Nombre };
            }
            // Si aún no hay roles, asignar uno por defecto
            else if (!roles.Any())
            {
                roles = new List<string> { "User" };
            }

            // Crear y devolver el DTO con los datos del usuario
            var userDto = new UserDto
            {
                UserId = user.Id.ToString(),
                FullName = $"{user.UserName} {user.UsuarioApellidos}".Trim(),
                Email = user.Email,
                Roles = roles,
                Permissions = new List<string>() // Implementar si se requiere
            };

            return userDto;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener datos del usuario {UserId}: {Message}", userId, ex.Message);
            throw;
        }
    }

    private async Task<string> GenerateJwtToken(Usuario user)
    {
        if (user == null)
        {
            throw new ArgumentNullException(nameof(user));
        }

        //var userRoles = await _userManager.GetRolesAsync(user);
        var userRoles = await _perfilService.GetPerfilByIdAsync(user.PerfilId).ConfigureAwait(false);

        _logger.LogDebug("Generando token JWT para el usuario {UserId} con roles: {Roles}",
            user.Id, string.Join(", ", userRoles.Nombre));

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.UserName ?? string.Empty),
            new Claim(ClaimTypes.Email, user.Email ?? string.Empty),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

        // Agregar roles como claims
        claims.Add(new Claim(ClaimTypes.Role, userRoles.Nombre));

        //if (userRoles != null && userRoles.Any())
        //{
        //    foreach (var role in userRoles)
        //    {
        //        if (!string.IsNullOrWhiteSpace(role))
        //        {
        //            claims.Add(new Claim(ClaimTypes.Role, role));
        //        }
        //    }
        //}
        //else
        //{
        //    _logger.LogWarning("El usuario {UserId} no tiene roles asignados", user.Id);
        //}

        // Aquí podrías agregar claims personalizados adicionales
        // claims.Add(new Claim("CustomClaim", "Value"));

        return _tokenService.GenerateAccessToken(claims);
    }

    private RefreshToken GenerateRefreshToken(string ipAddress)
    {
        return new RefreshToken
        {
            Token = _tokenService.GenerateRefreshToken(),
            FechaExpiracion = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpirationInDays),
            CreadoPorIp = ipAddress,
            Revocado = false
        };
    }

    private void RemoveOldRefreshTokens(Usuario user)
    {
        if (user?.RefreshTokens == null || !user.RefreshTokens.Any())
        {
            return;
        }

        // Eliminar tokens expirados que no han sido usados
        var tokensToRemove = user.RefreshTokens
            .Where(x => !x.Revocado && x.FechaExpiracion <= DateTime.UtcNow)
            .ToList();

        if (tokensToRemove.Any())
        {
            _logger.LogInformation("Eliminando {Count} tokens de actualización vencidos para el usuario {UserId}",
                tokensToRemove.Count, user.Id);

            foreach (var token in tokensToRemove)
            {
                user.RefreshTokens.Remove(token);
            }
        }

        // Opcional: También podrías querer eliminar tokens revocados muy antiguos
        var oldRevokedTokens = user.RefreshTokens
            .Where(x => x.Revocado && x.FechaRevocacion < DateTime.UtcNow.AddDays(-30))
            .ToList();

        if (oldRevokedTokens.Any())
        {
            _logger.LogInformation("Eliminando {Count} tokens revocados antiguos para el usuario {UserId}",
                oldRevokedTokens.Count, user.Id);

            foreach (var token in oldRevokedTokens)
            {
                user.RefreshTokens.Remove(token);
            }
        }
    }

    private void RevokeDescendantRefreshTokens(RefreshToken refreshToken, Usuario user, string ipAddress, string reason)
    {
        if (string.IsNullOrEmpty(refreshToken.ReemplazadoPorToken))
        {
            return;
        }

        var childToken = user.RefreshTokens.SingleOrDefault(x => x.Token == refreshToken.ReemplazadoPorToken);
        if (childToken == null)
        {
            return;
        }

        if (!childToken.Revocado)
        {
            RevokeRefreshToken(childToken, ipAddress, reason);
        }

        // Verificar si el token hijo tiene sus propios descendientes
        if (!string.IsNullOrEmpty(childToken.ReemplazadoPorToken))
        {
            RevokeDescendantRefreshTokens(childToken, user, ipAddress, reason);
        }
    }

    private void RevokeRefreshToken(RefreshToken token, string ipAddress, string reason = null)
    {
        if (token.Revocado)
        {
            return; // Ya está revocado
        }

        token.Revocado = true;
        token.FechaRevocacion = DateTime.UtcNow;
        token.RazonRevocacion = reason ?? "Revocado por el sistema";

        // No actualizamos ReemplazadoPorToken aquí, ya que se hace en el método principal
        // para mantener un mejor control sobre la cadena de reemplazo
    }

    private RefreshToken RotateRefreshToken(RefreshToken refreshToken, string ipAddress)
    {
        var newRefreshToken = GenerateRefreshToken(ipAddress);

        // Configurar la relación bidireccional
        newRefreshToken.UsuarioId = refreshToken.UsuarioId;

        // No necesitamos llamar a RevokeRefreshToken aquí porque ya lo hacemos en el método principal
        return newRefreshToken;
    }

    #endregion Métodos privados
}