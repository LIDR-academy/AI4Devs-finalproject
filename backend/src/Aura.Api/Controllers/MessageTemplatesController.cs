using Aura.Core.DTOs.MessageTemplates;
using Aura.Core.Exceptions;
using Aura.Core.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Aura.Api.Controllers;

[ApiController]
[Route("api/events/{slug}/message-templates")]
[Authorize]
public class MessageTemplatesController : ControllerBase
{
    private readonly IMessageTemplateService _messageTemplateService;

    public MessageTemplatesController(IMessageTemplateService messageTemplateService)
    {
        _messageTemplateService = messageTemplateService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MessageTemplateResponse>>> GetTemplates(string slug, CancellationToken cancellationToken)
    {
        var templates = await _messageTemplateService.GetTemplatesByEventAsync(slug, cancellationToken);
        return Ok(templates);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<MessageTemplateResponse>> UpdateTemplate(string slug, Guid id, [FromBody] UpdateMessageTemplateRequest request, CancellationToken cancellationToken)
    {
        var response = await _messageTemplateService.UpdateTemplateAsync(slug, id, request, cancellationToken);
        return Ok(response);
    }
}
