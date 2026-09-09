using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TejaFlow.Application.Inventory;
using TejaFlow.Application.Security;
using TejaFlow.Domain.Enums;

namespace TejaFlow.WebApi.Controllers;

[ApiController]
[Authorize(Roles = $"{TejaFlowRoles.Admin},{TejaFlowRoles.Vendedor},{TejaFlowRoles.Almacenista},{TejaFlowRoles.Logistica}")]
[Route("api/tejas")]
public sealed class TejasController : ControllerBase
{
    private readonly InventoryService _inventoryService;

    public TejasController(InventoryService inventoryService)
    {
        _inventoryService = inventoryService;
    }

    [HttpGet]
    public async Task<IActionResult> Get(
        [FromQuery] MaterialTeja? material,
        [FromQuery] string? color,
        [FromQuery] bool? soloBajoStock,
        CancellationToken cancellationToken)
    {
        var inventory = await _inventoryService.GetInventoryAsync(
            new InventoryFilters(material, color, soloBajoStock),
            cancellationToken);

        return Ok(inventory);
    }

    [HttpGet("{idTeja:int}")]
    public async Task<IActionResult> GetById(int idTeja, CancellationToken cancellationToken)
    {
        var inventory = await _inventoryService.GetInventoryByIdAsync(idTeja, cancellationToken);

        return inventory is null ? NotFound() : Ok(inventory);
    }

    [HttpGet("{idTeja:int}/lotes")]
    public async Task<IActionResult> GetLots(int idTeja, CancellationToken cancellationToken)
    {
        var product = await _inventoryService.GetInventoryByIdAsync(idTeja, cancellationToken);
        if (product is null)
        {
            return NotFound();
        }

        var lots = await _inventoryService.GetLotsByTileAsync(idTeja, cancellationToken);
        return Ok(lots);
    }
}

