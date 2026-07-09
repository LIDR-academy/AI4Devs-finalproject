using Aura.Core.Interfaces.Repositories;
using Aura.Core.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Aura.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "EventOwner")]
public class TemplatesController : ControllerBase
{
    private readonly ITemplateRepository _templateRepository;

    public TemplatesController(ITemplateRepository templateRepository)
    {
        _templateRepository = templateRepository;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Template>>> GetTemplates()
    {
        var templates = await _templateRepository.GetAllAsync();
        return Ok(templates);
    }
}
