using Aura.Core.DTOs.Accomplices;
using Aura.Core.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Aura.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AccomplicesController : ControllerBase
{
    private readonly IAccompliceService _accompliceService;

    public AccomplicesController(IAccompliceService accompliceService)
    {
        _accompliceService = accompliceService;
    }

    [HttpGet("{eventSlug}")]
    [Authorize(Policy = "HostScoped")]
    public async Task<IActionResult> GetAccomplices(string eventSlug, CancellationToken cancellationToken)
    {
        var accomplices = await _accompliceService.GetAccomplicesByEventAsync(eventSlug, cancellationToken);
        return Ok(accomplices);
    }

    [HttpPost("{eventSlug}/grant")]
    [Authorize(Policy = "HostScoped")]
    public async Task<IActionResult> GrantAccess(string eventSlug, [FromBody] GrantAccessRequest request, CancellationToken cancellationToken)
    {
        var response = await _accompliceService.GrantAccessAsync(eventSlug, request, cancellationToken);
        return Ok(response);
    }

    [HttpPost("{eventSlug}/revoke/{accompliceId}")]
    [Authorize(Policy = "HostScoped")]
    public async Task<IActionResult> RevokeAccess(string eventSlug, Guid accompliceId, CancellationToken cancellationToken)
    {
        await _accompliceService.RevokeAccessAsync(accompliceId, cancellationToken);
        return Ok();
    }

    [HttpPost("{eventSlug}/resend/{accompliceId}")]
    [Authorize(Policy = "HostScoped")]
    public async Task<IActionResult> ResendMagicLink(string eventSlug, Guid accompliceId, CancellationToken cancellationToken)
    {
        await _accompliceService.ResendMagicLinkAsync(accompliceId, cancellationToken);
        return Ok();
    }

    [HttpGet("verify")]
    public async Task<IActionResult> VerifyToken([FromQuery] string token, CancellationToken cancellationToken)
    {
        try
        {
            var jwt = await _accompliceService.VerifyTokenAsync(token, cancellationToken);

            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true, // Should be environment dependent, but we'll stick to true for now or configure it
                SameSite = SameSiteMode.Strict,
                Expires = DateTimeOffset.UtcNow.AddHours(24)
            };

            Response.Cookies.Append("aura_session", jwt, cookieOptions);

            var csrfToken = Guid.NewGuid().ToString("N");
            var csrfCookieOptions = new CookieOptions
            {
                HttpOnly = false,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTimeOffset.UtcNow.AddHours(24)
            };
            
            Response.Cookies.Append("aura_csrf", csrfToken, csrfCookieOptions);

            return Ok(new { Message = "Accomplice verified successfully." });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { Message = ex.Message });
        }
    }
}
