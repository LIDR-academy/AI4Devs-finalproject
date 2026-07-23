namespace Aura.Core.DTOs.Dashboard;

public class GuestExportDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string? InviteStatus { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string Category { get; set; } = null!;
    public string RsvpStatus { get; set; } = null!;
    public string? DietaryRestrictions { get; set; }
    public bool TransportNeeds { get; set; }
}
