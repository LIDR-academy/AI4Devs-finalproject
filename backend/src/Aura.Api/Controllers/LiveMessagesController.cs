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

    [HttpPost("api/live/{accompliceToken}/send")]
    [AllowAnonymous]
    public async Task<ActionResult<LiveMessageResponse>> SendLiveMessage(string accompliceToken, [FromBody] SendLiveMessageRequest request, CancellationToken cancellationToken)
    {
        var response = await _liveMessageService.SendLiveMessageAsync(accompliceToken, request, cancellationToken);
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
