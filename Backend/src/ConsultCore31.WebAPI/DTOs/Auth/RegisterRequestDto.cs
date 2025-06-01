using System.ComponentModel.DataAnnotations;

namespace ConsultCore31.WebAPI.DTOs.Auth;

public class RegisterRequestDto
{
    [Required(ErrorMessage = "El nombre es requerido")]
    public string FirstName { get; set; } = string.Empty;

    [Required(ErrorMessage = "El apellido es requerido")]
    public string LastName { get; set; } = string.Empty;

    [Required(ErrorMessage = "El nombre de usuario es requerido")]
    public string UserName { get; set; } = string.Empty;

    [Required(ErrorMessage = "El correo electrónico es requerido")]
    [EmailAddress(ErrorMessage = "El formato del correo electrónico no es válido")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "La contraseña es requerida")]
    [StringLength(100, ErrorMessage = "La {0} debe tener al menos {2} y como máximo {1} caracteres.", MinimumLength = 6)]
    [DataType(DataType.Password)]
    public string Password { get; set; } = string.Empty;

    [DataType(DataType.Password)]
    [Compare("Password", ErrorMessage = "La contraseña y la confirmación no coinciden.")]
    public string ConfirmPassword { get; set; } = string.Empty;
}
