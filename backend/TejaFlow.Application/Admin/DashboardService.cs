using Microsoft.EntityFrameworkCore;
using TejaFlow.Application.Common.Interfaces;
using TejaFlow.Domain.Enums;

namespace TejaFlow.Application.Admin;

public sealed class DashboardService
{
    private readonly ITejaFlowDbContext _context;

    public DashboardService(ITejaFlowDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardDto> GetDashboardAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var monthStart = new DateTime(now.Year, now.Month, 1);
        var nextMonthStart = monthStart.AddMonths(1);
        var yearStart = monthStart.AddMonths(-11);

        var paidOrders = _context.PedidosVenta
            .AsNoTracking()
            .Where(pedido => pedido.EstadoPedido != EstadoPedido.Cotizacion && pedido.EstadoPedido != EstadoPedido.Cancelado);

        var ingresoMesActual = await paidOrders
            .Where(pedido => pedido.FechaPedido >= monthStart && pedido.FechaPedido < nextMonthStart)
            .SumAsync(pedido => (decimal?)pedido.Total, cancellationToken) ?? 0m;

        var ventasMesActual = await paidOrders
            .CountAsync(pedido => pedido.FechaPedido >= monthStart && pedido.FechaPedido < nextMonthStart, cancellationToken);

        var pedidosPendientesEntrega = await _context.PedidosVenta
            .AsNoTracking()
            .CountAsync(pedido => pedido.EstadoPedido == EstadoPedido.Pagado || pedido.EstadoPedido == EstadoPedido.Parcial, cancellationToken);

        var alertasInventario = await _context.ProductosTeja
            .AsNoTracking()
            .Where(teja => teja.StockGlobal <= teja.StockMinimo)
            .OrderBy(teja => teja.StockGlobal)
            .ThenBy(teja => teja.Modelo)
            .Select(teja => new AlertaReordenDto(
                teja.IdTeja,
                teja.Modelo,
                teja.Material.ToString(),
                teja.Color,
                teja.StockGlobal,
                teja.StockMinimo,
                teja.PrecioBase))
            .ToListAsync(cancellationToken);

        var mermasRecientes = await _context.MermasRotura
            .AsNoTracking()
            .Include(merma => merma.Lote)
                .ThenInclude(lote => lote!.Teja)
            .OrderByDescending(merma => merma.FechaRegistro)
            .Take(8)
            .Select(merma => new MermaResumenDto(
                merma.IdMerma,
                merma.Lote!.Teja!.Modelo,
                merma.Lote.CodigoLote,
                merma.CantidadRotas,
                merma.CantidadRotas * merma.Lote.Teja.PrecioBase,
                merma.Motivo,
                merma.FechaRegistro))
            .ToListAsync(cancellationToken);

        var perdidaMermaMesActual = await _context.MermasRotura
            .AsNoTracking()
            .Where(merma => merma.FechaRegistro >= monthStart && merma.FechaRegistro < nextMonthStart)
            .Select(merma => (decimal?)(merma.CantidadRotas * merma.Lote!.Teja!.PrecioBase))
            .SumAsync(cancellationToken) ?? 0m;

        var ventasMensuales = await paidOrders
            .Where(pedido => pedido.FechaPedido >= yearStart)
            .GroupBy(pedido => new { pedido.FechaPedido.Year, pedido.FechaPedido.Month })
            .Select(group => new VentaMensualDto(
                group.Key.Year,
                group.Key.Month,
                $"{group.Key.Year}-{group.Key.Month:00}",
                group.Sum(pedido => pedido.Total)))
            .OrderBy(item => item.Anio)
            .ThenBy(item => item.Mes)
            .ToListAsync(cancellationToken);

        var modelosMasVendidos = await _context.DetallesPedido
            .AsNoTracking()
            .Include(detalle => detalle.Pedido)
            .Include(detalle => detalle.Teja)
            .Where(detalle => detalle.Pedido != null
                && detalle.Pedido.EstadoPedido != EstadoPedido.Cotizacion
                && detalle.Pedido.EstadoPedido != EstadoPedido.Cancelado)
            .GroupBy(detalle => new { detalle.IdTeja, detalle.Teja!.Modelo })
            .Select(group => new ModeloVendidoDto(
                group.Key.IdTeja,
                group.Key.Modelo,
                group.Sum(detalle => detalle.CantidadSolicitada),
                group.Sum(detalle => detalle.Subtotal)))
            .OrderByDescending(item => item.CantidadVendida)
            .Take(5)
            .ToListAsync(cancellationToken);

        var pagosPorMetodo = await _context.PagosVenta
            .AsNoTracking()
            .Where(pago => pago.EstadoPago == EstadoPago.Pagado)
            .GroupBy(pago => pago.MetodoPago)
            .Select(group => new PagoMetodoDto(
                group.Key.ToString(),
                group.Count(),
                group.Sum(pago => pago.Monto)))
            .OrderByDescending(item => item.TotalPagado)
            .ToListAsync(cancellationToken);

        return new DashboardDto(
            ingresoMesActual,
            ventasMesActual,
            pedidosPendientesEntrega,
            alertasInventario.Count,
            perdidaMermaMesActual,
            ventasMensuales,
            modelosMasVendidos,
            pagosPorMetodo,
            alertasInventario,
            mermasRecientes);
    }
}
