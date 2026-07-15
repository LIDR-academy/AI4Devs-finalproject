using System;
using System.Threading;
using System.Threading.Tasks;
using Aura.Core.Interfaces.Services;
using Aura.Core.DTOs.Invitations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Aura.Api.Controllers;

[ApiController]
[Route("api/events/{slug}/invitations")]
[Authorize]
public class InvitationsController : ControllerBase
{
    private readonly IInvitationService _invitationService;

    public InvitationsController(IInvitationService invitationService)
    {
        _invitationService = invitationService;
    }

    [HttpGet]
    public async Task<IActionResult> GetInvitations(string slug, CancellationToken cancellationToken)
    {
        var invitations = await _invitationService.GetInvitationsByEventAsync(slug, cancellationToken);
        return Ok(invitations);
    }

    [HttpPost("send")]
    public async Task<IActionResult> SendInvitations(string slug, [FromBody] SendInvitationsRequest request, CancellationToken cancellationToken)
    {
        await _invitationService.SendInvitationsAsync(slug, cancellationToken);
        return Ok(new { message = "Invitations successfully enqueued for sending." });
    }
}
