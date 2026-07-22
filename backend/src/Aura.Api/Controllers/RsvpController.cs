using Aura.Core.DTOs.Rsvp;
using Aura.Core.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Aura.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RsvpController : ControllerBase
{
    private readonly IRsvpService _rsvpService;

    public RsvpController(IRsvpService rsvpService)
    {
        _rsvpService = rsvpService;
    }

    [HttpGet("{token}")]
    [EnableRateLimiting("RsvpGetPolicy")]
    public async Task<ActionResult<RsvpInfoResponse>> GetRsvpInfo(string token, CancellationToken cancellationToken)
    {
        var response = await _rsvpService.GetRsvpInfoAsync(token, cancellationToken);
        return Ok(response);
    }

    [HttpPost("{token}")]
    [EnableRateLimiting("RsvpSubmitPolicy")]
    public async Task<ActionResult<RsvpConfirmationResponse>> SubmitRsvp(string token, [FromBody] SubmitRsvpRequest request, CancellationToken cancellationToken)
    {
        var response = await _rsvpService.SubmitRsvpAsync(token, request, cancellationToken);
        return Ok(response);
    }
}
