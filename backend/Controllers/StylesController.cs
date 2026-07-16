using InkLink.Api.Application.Dtos;
using InkLink.Api.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InkLink.Api.Controllers;

[ApiController]
[Route("api/styles")]
public class StylesController : ControllerBase
{
    private readonly InkLinkDbContext _context;

    public StylesController(InkLinkDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// US0011 CA2 — Public tattoo style catalog (id, name, slug). The quote chatbot
    /// uses it to resolve the artist's style slugs into ids for QuoteRequest.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var styles = await _context.TattooStyles
            .OrderBy(s => s.Name)
            .Select(s => new TattooStyleDto(s.Id, s.Name, s.Slug))
            .ToListAsync(cancellationToken);
        return Ok(styles);
    }
}
