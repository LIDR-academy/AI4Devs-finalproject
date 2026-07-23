namespace Aura.Core.DTOs.Accomplices;

public class GrantAccessRequest
{
    public string Email { get; set; } = null!;
    public List<string> Permissions { get; set; } = new();
}
