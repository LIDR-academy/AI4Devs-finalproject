using Aura.Core.DTOs.LiveMessages;
using Aura.Core.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Aura.Api.Controllers;

[ApiController]
public class LiveMessagesController : ControllerBase
{
    private readonly ILiveMessageService _liveMessageService;

    public LiveMessagesController(ILiveMessageService liveMessageService)
    {
        _liveMessageService = liveMessageService;
    }

    [HttpPost("api/live/{slug}/send")]
    [Authorize(Policy = "AccompliceScoped")]
    public async Task<ActionResult<LiveMessageResponse>> SendLiveMessage(string slug, [FromBody] SendLiveMessageRequest request, CancellationToken cancellationToken)
    {
        var accompliceIdStr = User.FindFirst(System.Security.Claims.JwtRegisteredClaimNames.Sub)?.Value;
        if (!Guid.TryParse(accompliceIdStr, out var accompliceId))
            return Unauthorized(new { Message = "Invalid accomplice token." });

        var response = await _liveMessageService.SendLiveMessageAsync(accompliceId, slug, request, cancellationToken);
        return Accepted(response);
    }

    [HttpGet("api/events/{slug}/live-messages")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<LiveMessageResponse>>> GetLiveMessages(string slug, CancellationToken cancellationToken)
    {
        var messages = await _liveMessageService.GetLiveMessagesByEventAsync(slug, cancellationToken);
        return Ok(messages);
    }
}
