using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TejaFlow.Application.Logistics;
using TejaFlow.Application.Security;

namespace TejaFlow.WebApi.Controllers;

[ApiController]
[Authorize(Policy = TejaFlowPolicies.Logistics)]
[Route("api/logistica")]
public sealed class LogisticaController : ControllerBase
{
    private readonly LogisticsService _logisticsService;

    public LogisticaController(LogisticsService logisticsService)
    {
        _logisticsService = logisticsService;
    }

    [HttpGet("pedidos-pendientes")]
    public async Task<IActionResult> GetPedidosPendientes(CancellationToken cancellationToken)
    {
        var pedidos = await _logisticsService.GetPedidosPendientesAsync(cancellationToken);
        return Ok(pedidos);
    }

    [HttpPost("despachos")]
    public async Task<IActionResult> CrearDespacho(
        [FromBody] CrearDespachoRequest request,
        CancellationToken cancellationToken)
    {
        var idUsuarioClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(idUsuarioClaim, out var idUsuario))
        {
            return Unauthorized(new { message = "Token JWT invalido: falta el identificador del usuario." });
        }

        var result = await _logisticsService.CrearDespachoAsync(request, idUsuario, cancellationToken);

        if (!result.Success || result.Despacho is null)
        {
            return BadRequest(new { message = result.Error });
        }

        return CreatedAtAction(nameof(CrearDespacho), new { id = result.Despacho.IdDespacho }, result.Despacho);
    }
}

