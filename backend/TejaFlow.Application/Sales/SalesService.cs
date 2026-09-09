using Microsoft.EntityFrameworkCore;
using TejaFlow.Application.Common.Interfaces;
using TejaFlow.Domain.Entities;
using TejaFlow.Domain.Enums;

namespace TejaFlow.Application.Sales;

public sealed class SalesService
{
    private const decimal IvaRate = 0.16m;
    private readonly ITejaFlowDbContext _context;

    public SalesService(ITejaFlowDbContext context)
    {
        _context = context;
    }

    public async Task<SalesResult> CrearVentaPagadaAsync(
        CrearVentaRequest request,
        int idUsuario,
        CancellationToken cancellationToken = default)
    {
        var validation = ValidateCreateRequest(request);
        if (validation is not null)
        {
            return SalesResult.Failed(validation);
        }

        var clienteExists = await _context.Clientes
            .AsNoTracking()
            .AnyAsync(cliente => cliente.IdCliente == request.IdCliente, cancellationToken);

        if (!clienteExists)
        {
            return SalesResult.Failed("El cliente especificado no existe.");
        }

        await using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);

        var detalles = new List<DetallePedido>();
        var stockAfectado = new List<StockAfectadoDto>();
        decimal subtotal = 0m;

        foreach (var detalleRequest in request.Detalles)
        {
            var producto = await _context.ProductosTeja
                .Include(teja => teja.Lotes)
                .FirstOrDefaultAsync(teja => teja.IdTeja == detalleRequest.IdTeja, cancellationToken);

            if (producto is null)
            {
                return SalesResult.Failed($"La teja {detalleRequest.IdTeja} no existe.");
            }

            var precioUnitario = detalleRequest.PrecioUnitario ?? ApplyVolumeDiscount(producto.PrecioBase, detalleRequest.Cantidad);
            var detalle = new DetallePedido
            {
                IdTeja = detalleRequest.IdTeja,
                Teja = producto,
                CantidadSolicitada = detalleRequest.Cantidad,
                CantidadDespachada = 0,
                PrecioUnitarioAplicado = precioUnitario,
                PendienteTechoGrados = detalleRequest.PendienteTechoGrados,
                MetrosCuadradosCalculados = detalleRequest.MetrosCuadradosCalculados
            };

            detalles.Add(detalle);
            subtotal += detalle.Subtotal;

            var affectation = await DescontarStockAsync(
                producto,
                detalleRequest.Cantidad,
                detalleRequest.IdLote,
                cancellationToken);

            if (!affectation.Success)
            {
                return SalesResult.Failed(affectation.Error!);
            }

            stockAfectado.AddRange(affectation.StockAfectado);
        }

        var impuestoIva = Math.Round(subtotal * IvaRate, 2);
        var total = subtotal + impuestoIva + request.CostoFlete;

        if (request.MontoPagado != total)
        {
            return SalesResult.Failed($"El monto pagado debe coincidir con el total de la venta: {total:N2}.");
        }

        var pedido = new PedidoVenta
        {
            IdCliente = request.IdCliente,
            IdUsuario = idUsuario,
            FechaPedido = DateTime.UtcNow,
            Subtotal = subtotal,
            ImpuestoIva = impuestoIva,
            CostoFlete = request.CostoFlete,
            Total = total,
            EstadoPedido = EstadoPedido.Pagado,
            Detalles = detalles,
            Pagos =
            [
                new PagoVenta
                {
                    MetodoPago = request.MetodoPago,
                    EstadoPago = EstadoPago.Pagado,
                    Monto = request.MontoPagado,
                    FechaPago = DateTime.UtcNow,
                    Referencia = BuildPaymentReference(request.ReferenciaPago, request.MetodoPago)
                }
            ]
        };

        await _context.PedidosVenta.AddAsync(pedido, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        foreach (var stock in stockAfectado)
        {
            await _context.MovimientosInventario.AddAsync(new MovimientoInventario
            {
                IdLote = stock.IdLote,
                IdPedido = pedido.IdPedido,
                IdUsuario = idUsuario,
                TipoMovimiento = TipoMovimientoInventario.Venta,
                Cantidad = -stock.CantidadDescontada,
                FechaMovimiento = DateTime.UtcNow,
                Referencia = $"VENTA-{pedido.IdPedido:D6}"
            }, cancellationToken);
        }

        await _context.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return SalesResult.Paid(MapVenta(pedido, stockAfectado));
    }

    public async Task<SalesResult> PagarCotizacionAsync(
        int idPedido,
        PagarPedidoRequest request,
        int idUsuario,
        CancellationToken cancellationToken = default)
    {
        if (request.Monto <= 0)
        {
            return SalesResult.Failed("El monto del pago debe ser mayor que cero.");
        }

        await using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);

        var pedido = await _context.PedidosVenta
            .Include(item => item.Detalles)
                .ThenInclude(detalle => detalle.Teja)
            .Include(item => item.Pagos)
            .FirstOrDefaultAsync(item => item.IdPedido == idPedido, cancellationToken);

        if (pedido is null)
        {
            return SalesResult.Failed("El pedido especificado no existe.");
        }

        if (pedido.EstadoPedido != EstadoPedido.Cotizacion)
        {
            return SalesResult.Failed("Solo se pueden pagar pedidos en estado Cotizacion.");
        }

        if (request.Monto != pedido.Total)
        {
            return SalesResult.Failed($"El monto pagado debe coincidir con el total de la venta: {pedido.Total:N2}.");
        }

        var stockAfectado = new List<StockAfectadoDto>();

        foreach (var detalle in pedido.Detalles)
        {
            var producto = await _context.ProductosTeja
                .Include(teja => teja.Lotes)
                .FirstAsync(teja => teja.IdTeja == detalle.IdTeja, cancellationToken);

            var affectation = await DescontarStockAsync(
                producto,
                detalle.CantidadSolicitada,
                idLote: null,
                cancellationToken);

            if (!affectation.Success)
            {
                return SalesResult.Failed(affectation.Error!);
            }

            stockAfectado.AddRange(affectation.StockAfectado);
        }

        pedido.MarcarPagado();
        pedido.Pagos.Add(new PagoVenta
        {
            MetodoPago = request.MetodoPago,
            EstadoPago = EstadoPago.Pagado,
            Monto = request.Monto,
            FechaPago = DateTime.UtcNow,
            Referencia = BuildPaymentReference(request.ReferenciaPago, request.MetodoPago)
        });

        await _context.SaveChangesAsync(cancellationToken);

        foreach (var stock in stockAfectado)
        {
            await _context.MovimientosInventario.AddAsync(new MovimientoInventario
            {
                IdLote = stock.IdLote,
                IdPedido = pedido.IdPedido,
                IdUsuario = idUsuario,
                TipoMovimiento = TipoMovimientoInventario.Venta,
                Cantidad = -stock.CantidadDescontada,
                FechaMovimiento = DateTime.UtcNow,
                Referencia = $"VENTA-{pedido.IdPedido:D6}"
            }, cancellationToken);
        }

        await _context.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return SalesResult.Paid(MapVenta(pedido, stockAfectado));
    }

    private async Task<StockAffectationResult> DescontarStockAsync(
        ProductoTeja producto,
        int cantidad,
        int? idLote,
        CancellationToken cancellationToken)
    {
        var lotes = producto.Lotes
            .Where(lote => !idLote.HasValue || lote.IdLote == idLote.Value)
            .OrderBy(lote => lote.FechaEntrada)
            .ToList();

        if (idLote.HasValue && lotes.Count == 0)
        {
            return StockAffectationResult.Failed("El lote especificado no pertenece a la teja seleccionada.");
        }

        var stockDisponible = lotes.Sum(lote => lote.CantidadActual);
        if (stockDisponible < cantidad)
        {
            return StockAffectationResult.Failed("No hay stock suficiente para confirmar la venta.");
        }

        var restante = cantidad;
        var stockAfectado = new List<StockAfectadoDto>();

        foreach (var lote in lotes)
        {
            if (restante == 0)
            {
                break;
            }

            var cantidadADescontar = Math.Min(lote.CantidadActual, restante);
            lote.DescontarStock(cantidadADescontar);
            restante -= cantidadADescontar;

            var stockGlobal = producto.Lotes.Sum(item => item.CantidadActual);

            producto.ActualizarStockGlobal(stockGlobal);

            stockAfectado.Add(new StockAfectadoDto(
                producto.IdTeja,
                producto.Modelo,
                lote.IdLote,
                lote.CodigoLote,
                cantidadADescontar,
                lote.CantidadActual,
                stockGlobal));
        }

        return StockAffectationResult.Successful(stockAfectado);
    }

    private static string? ValidateCreateRequest(CrearVentaRequest request)
    {
        if (request.IdCliente <= 0)
        {
            return "El cliente especificado no es valido.";
        }

        if (request.Detalles.Count == 0)
        {
            return "La venta debe incluir al menos una partida.";
        }

        if (request.MontoPagado <= 0)
        {
            return "El monto pagado debe ser mayor que cero.";
        }

        if (request.CostoFlete < 0)
        {
            return "El costo de flete no puede ser negativo.";
        }

        foreach (var detalle in request.Detalles)
        {
            if (detalle.IdTeja <= 0 || detalle.Cantidad <= 0)
            {
                return "Cada partida debe incluir una teja valida y una cantidad mayor que cero.";
            }

            if (detalle.PrecioUnitario < 0)
            {
                return "El precio unitario no puede ser negativo.";
            }

            if (detalle.PendienteTechoGrados < 0 || detalle.PendienteTechoGrados > 90)
            {
                return "La pendiente del techo debe estar entre 0 y 90 grados.";
            }

            if (detalle.MetrosCuadradosCalculados <= 0)
            {
                return "Los metros cuadrados calculados deben ser mayores que cero.";
            }
        }

        return null;
    }

    private static decimal ApplyVolumeDiscount(decimal basePrice, int quantity)
    {
        var discount = quantity switch
        {
            >= 5000 => 0.12m,
            >= 2500 => 0.08m,
            >= 1000 => 0.05m,
            _ => 0m
        };

        return Math.Round(basePrice * (1 - discount), 2);
    }

    private static string BuildPaymentReference(string? reference, MetodoPago metodoPago)
    {
        if (!string.IsNullOrWhiteSpace(reference))
        {
            return reference.Trim();
        }

        return metodoPago == MetodoPago.Efectivo
            ? "PAGO-EFECTIVO"
            : $"PAGO-{metodoPago.ToString().ToUpperInvariant()}";
    }

    private static VentaPagadaDto MapVenta(PedidoVenta pedido, IReadOnlyCollection<StockAfectadoDto> stockAfectado)
    {
        var pago = pedido.Pagos.Last();

        return new VentaPagadaDto(
            pedido.IdPedido,
            pago.IdPago,
            pedido.EstadoPedido.ToString(),
            pago.MetodoPago.ToString(),
            pedido.Subtotal,
            pedido.ImpuestoIva,
            pedido.CostoFlete,
            pedido.Total,
            pago.Monto,
            pedido.Detalles.Select(detalle => new VentaDetalleDto(
                detalle.IdDetalle,
                detalle.IdTeja,
                detalle.Teja?.Modelo ?? string.Empty,
                detalle.CantidadSolicitada,
                detalle.PrecioUnitarioAplicado,
                detalle.Subtotal)).ToList(),
            stockAfectado);
    }

    private sealed record StockAffectationResult(
        bool Success,
        string? Error,
        IReadOnlyCollection<StockAfectadoDto> StockAfectado)
    {
        public static StockAffectationResult Failed(string error)
        {
            return new StockAffectationResult(false, error, []);
        }

        public static StockAffectationResult Successful(IReadOnlyCollection<StockAfectadoDto> stockAfectado)
        {
            return new StockAffectationResult(true, null, stockAfectado);
        }
    }
}
