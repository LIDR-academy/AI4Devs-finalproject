using System.ComponentModel.DataAnnotations;

namespace Aura.Core.DTOs.Auth;

public class ProfileSetupRequest
{
    [Required]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    public bool AcceptsTerms { get; set; }
    
    [Required]
    public bool AcceptsDataProcessing { get; set; }
    
    public string? Timezone { get; set; }
    public string? Locale { get; set; }
}
