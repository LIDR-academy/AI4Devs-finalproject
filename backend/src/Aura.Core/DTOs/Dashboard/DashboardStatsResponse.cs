using System.Collections.Generic;

namespace Aura.Core.DTOs.Dashboard;

public class DashboardStatsResponse
{
    public int TotalInvited { get; set; }
    public int Confirmed { get; set; }
    public int Declined { get; set; }
    public int Pending { get; set; }
    public int Maybe { get; set; }
    public int TransportNeedsCount { get; set; }
    public int PlusOneCount { get; set; }
    public List<DietaryRestrictionDto> DietaryRestrictions { get; set; } = new();
    public List<GuestExportDto> GuestList { get; set; } = new();
}

public class DietaryRestrictionDto
{
    public string GuestName { get; set; } = null!;
    public string Restrictions { get; set; } = null!;
}
