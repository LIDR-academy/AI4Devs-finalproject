using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TejaFlow.Application.Admin;
using TejaFlow.Application.Security;

namespace TejaFlow.WebApi.Controllers;

[ApiController]
[Authorize(Policy = TejaFlowPolicies.AdminOnly)]
[Route("api/admin")]
public sealed class AdminController : ControllerBase
{
    private readonly DashboardService _dashboardService;

    public AdminController(DashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard(CancellationToken cancellationToken)
    {
        var dashboard = await _dashboardService.GetDashboardAsync(cancellationToken);
        return Ok(dashboard);
    }
}
