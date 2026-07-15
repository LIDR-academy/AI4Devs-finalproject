using System;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Aura.Core.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Aura.Api.Controllers;

[ApiController]
[Route("api/events/{slug}")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    private Guid GetUserId()
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (Guid.TryParse(userIdString, out var userId))
            return userId;
        throw new UnauthorizedAccessException();
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboardStats(string slug, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var stats = await _dashboardService.GetDashboardStatsAsync(slug, userId, cancellationToken);
        return Ok(stats);
    }

    [HttpGet("guests/export")]
    public async Task<IActionResult> ExportGuestList(string slug, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var csvBytes = await _dashboardService.ExportGuestListCsvAsync(slug, userId, cancellationToken);
        return File(csvBytes, "text/csv", $"guest_list_{slug}_{DateTime.UtcNow:yyyyMMddHHmmss}.csv");
    }
}
