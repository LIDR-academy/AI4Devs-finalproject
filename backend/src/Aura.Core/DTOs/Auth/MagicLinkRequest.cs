using System.ComponentModel.DataAnnotations;

namespace Aura.Core.DTOs.Auth;

public class MagicLinkRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
}
