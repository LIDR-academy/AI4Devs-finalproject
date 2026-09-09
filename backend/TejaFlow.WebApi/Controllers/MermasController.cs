using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TejaFlow.Application.Breakage;
using TejaFlow.Application.Security;

namespace TejaFlow.WebApi.Controllers;

[ApiController]
[Authorize(Policy = TejaFlowPolicies.Warehouse)]
[Route("api/inventario/mermas")]
public sealed class MermasController : ControllerBase
{
    private readonly BreakageService _breakageService;

    public MermasController(BreakageService breakageService)
    {
        _breakageService = breakageService;
    }

    [HttpPost]
    public async Task<IActionResult> RegistrarMerma(
        [FromBody] RegistrarMermaRequest request,
        CancellationToken cancellationToken)
    {
        var idUsuarioClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(idUsuarioClaim, out var idUsuario))
        {
            return Unauthorized(new { message = "Token JWT invalido: falta el identificador del usuario." });
        }

        var result = await _breakageService.RegistrarMermaAsync(request, idUsuario, cancellationToken);

        if (!result.Success || result.Merma is null)
        {
            return BadRequest(new { message = result.Error });
        }

        return CreatedAtAction(
            nameof(RegistrarMerma),
            new { id = result.Merma.IdMerma },
            result.Merma);
    }
}

