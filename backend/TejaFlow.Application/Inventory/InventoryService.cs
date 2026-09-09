using Microsoft.EntityFrameworkCore;
using TejaFlow.Application.Common.Interfaces;
using TejaFlow.Domain.Entities;

namespace TejaFlow.Application.Inventory;

public sealed class InventoryService
{
    private readonly ITejaFlowDbContext _context;

    public InventoryService(ITejaFlowDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyCollection<TejaInventarioDto>> GetInventoryAsync(
        InventoryFilters filters,
        CancellationToken cancellationToken = default)
    {
        var query = _context.ProductosTeja
            .AsNoTracking()
            .Include(teja => teja.Lotes)
            .AsQueryable();

        if (filters.Material.HasValue)
        {
            query = query.Where(teja => teja.Material == filters.Material.Value);
        }

        if (!string.IsNullOrWhiteSpace(filters.Color))
        {
            var color = filters.Color.Trim();
            query = query.Where(teja => teja.Color.Contains(color));
        }

        if (filters.SoloBajoStock == true)
        {
            query = query.Where(teja => teja.StockGlobal <= teja.StockMinimo);
        }

        var productos = await query
            .OrderBy(teja => teja.Modelo)
            .ThenBy(teja => teja.Color)
            .ToListAsync(cancellationToken);

        return productos.Select(MapToDto).ToList();
    }

    public async Task<TejaInventarioDto?> GetInventoryByIdAsync(
        int idTeja,
        CancellationToken cancellationToken = default)
    {
        var producto = await _context.ProductosTeja
            .AsNoTracking()
            .Include(teja => teja.Lotes)
            .FirstOrDefaultAsync(teja => teja.IdTeja == idTeja, cancellationToken);

        return producto is null ? null : MapToDto(producto);
    }

    public async Task<IReadOnlyCollection<LoteInventarioDto>> GetLotsByTileAsync(
        int idTeja,
        CancellationToken cancellationToken = default)
    {
        return await _context.LotesProduccion
            .AsNoTracking()
            .Where(lote => lote.IdTeja == idTeja)
            .OrderByDescending(lote => lote.FechaEntrada)
            .Select(lote => new LoteInventarioDto(
                lote.IdLote,
                lote.CodigoLote,
                lote.FechaEntrada,
                lote.CantidadInicial,
                lote.CantidadActual))
            .ToListAsync(cancellationToken);
    }

    private static TejaInventarioDto MapToDto(ProductoTeja teja)
    {
        var lotes = teja.Lotes
            .OrderByDescending(lote => lote.FechaEntrada)
            .Select(lote => new LoteInventarioDto(
                lote.IdLote,
                lote.CodigoLote,
                lote.FechaEntrada,
                lote.CantidadInicial,
                lote.CantidadActual))
            .ToList();

        return new TejaInventarioDto(
            teja.IdTeja,
            teja.Modelo,
            teja.Material.ToString(),
            teja.Color,
            teja.LongitudCm,
            teja.AnchoCm,
            teja.PesoKg,
            teja.PrecioBase,
            teja.StockGlobal,
            teja.StockMinimo,
            teja.RequiereReorden,
            lotes);
    }
}

