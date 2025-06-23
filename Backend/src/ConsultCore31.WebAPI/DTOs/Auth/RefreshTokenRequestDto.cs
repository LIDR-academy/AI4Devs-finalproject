using System.ComponentModel.DataAnnotations;

namespace ConsultCore31.WebAPI.DTOs.Auth;

public class RefreshTokenRequestDto
{
    [Required(ErrorMessage = "El token de acceso es requerido")]
    public string Token { get; set; } = string.Empty;

    [Required(ErrorMessage = "El token de actualización es requerido")]
    public string RefreshToken { get; set; } = string.Empty;
}