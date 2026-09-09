using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TejaFlow.Application.Quotations;
using TejaFlow.Application.Sales;
using TejaFlow.Application.Security;

namespace TejaFlow.WebApi.Controllers;

[ApiController]
[Authorize(Policy = TejaFlowPolicies.Sales)]
[Route("api/ventas")]
public sealed class VentasController : ControllerBase
{
    private readonly QuotationService _quotationService;
    private readonly SalesService _salesService;

    public VentasController(QuotationService quotationService, SalesService salesService)
    {
        _quotationService = quotationService;
        _salesService = salesService;
    }

    [HttpPost("cotizar")]
    public async Task<IActionResult> Cotizar(
        [FromBody] CotizacionRequest request,
        CancellationToken cancellationToken)
    {
        var idUsuarioClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(idUsuarioClaim, out var idUsuario))
        {
            return Unauthorized(new { message = "Token JWT invalido: falta el identificador del usuario." });
        }

        var result = await _quotationService.CreateQuotationAsync(request, idUsuario, cancellationToken);

        if (!result.Success || result.Cotizacion is null)
        {
            return BadRequest(new { message = result.Error });
        }

        return Ok(result.Cotizacion);
    }

    [HttpPost]
    public async Task<IActionResult> CrearVenta(
        [FromBody] CrearVentaRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var idUsuario))
        {
            return Unauthorized(new { message = "Token JWT invalido: falta el identificador del usuario." });
        }

        var result = await _salesService.CrearVentaPagadaAsync(request, idUsuario, cancellationToken);

        if (!result.Success || result.Venta is null)
        {
            return BadRequest(new { message = result.Error });
        }

        return CreatedAtAction(nameof(CrearVenta), new { id = result.Venta.IdPedido }, result.Venta);
    }

    [HttpPost("{idPedido:int}/pagar")]
    public async Task<IActionResult> PagarCotizacion(
        int idPedido,
        [FromBody] PagarPedidoRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var idUsuario))
        {
            return Unauthorized(new { message = "Token JWT invalido: falta el identificador del usuario." });
        }

        var result = await _salesService.PagarCotizacionAsync(idPedido, request, idUsuario, cancellationToken);

        if (!result.Success || result.Venta is null)
        {
            return BadRequest(new { message = result.Error });
        }

        return Ok(result.Venta);
    }

    private bool TryGetUserId(out int idUsuario)
    {
        var idUsuarioClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(idUsuarioClaim, out idUsuario);
    }
}
