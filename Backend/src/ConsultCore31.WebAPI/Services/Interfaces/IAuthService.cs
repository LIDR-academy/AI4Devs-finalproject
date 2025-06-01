using ConsultCore31.WebAPI.DTOs.Auth;

namespace ConsultCore31.WebAPI.Services.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto> LoginAsync(LoginRequestDto request, string ipAddress);
    Task<AuthResponseDto> RefreshTokenAsync(RefreshTokenRequestDto request, string ipAddress);
    Task<bool> RevokeTokenAsync(string token, string ipAddress);
    Task<bool> RegisterAsync(RegisterRequestDto request, string origin);
    Task<bool> ConfirmEmailAsync(string userId, string token);
    Task<bool> ForgotPasswordAsync(string email, string origin);
    Task<bool> ResetPasswordAsync(ResetPasswordRequestDto request);
}
