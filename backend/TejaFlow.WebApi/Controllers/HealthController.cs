using Microsoft.AspNetCore.Mvc;

namespace TejaFlow.WebApi.Controllers;

[ApiController]
[Route("api/health")]
public sealed class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new
        {
            service = "TejaFlow API",
            status = "Healthy",
            timestamp = DateTimeOffset.UtcNow
        });
    }
}

