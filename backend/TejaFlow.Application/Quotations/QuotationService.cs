using Microsoft.EntityFrameworkCore;
using TejaFlow.Application.Common.Interfaces;
using TejaFlow.Domain.Entities;
using TejaFlow.Domain.Enums;

namespace TejaFlow.Application.Quotations;

public sealed class QuotationService
{
    private const decimal IvaRate = 0.16m;
    private readonly ITejaFlowDbContext _context;

    public QuotationService(ITejaFlowDbContext context)
    {
        _context = context;
    }

    public async Task<CotizacionResult> CreateQuotationAsync(
        CotizacionRequest request,
        int idUsuario,
        CancellationToken cancellationToken = default)
    {
        var validationError = ValidateRequest(request);
        if (validationError is not null)
        {
            return CotizacionResult.Failed(validationError);
        }

        var clienteExists = await _context.Clientes
            .AsNoTracking()
            .AnyAsync(cliente => cliente.IdCliente == request.IdCliente, cancellationToken);

        if (!clienteExists)
        {
            return CotizacionResult.Failed("El cliente especificado no existe.");
        }

        var teja = await _context.ProductosTeja
            .AsNoTracking()
            .FirstOrDefaultAsync(producto => producto.IdTeja == request.IdTeja, cancellationToken);

        if (teja is null)
        {
            return CotizacionResult.Failed("La teja especificada no existe.");
        }

        var metrosCuadradosCalculados = CalculateRoofSurface(request.MetrosBaseTecho, request.GradosPendiente);
        var coberturaPorTejaM2 = CalculateTileCoverage(teja);
        var cantidadTejasNeta = (int)Math.Ceiling(metrosCuadradosCalculados / coberturaPorTejaM2);
        var cantidadTejasConMerma = ApplyWasteMargin(cantidadTejasNeta, request.MargenMermaPorcentaje);
        var precioUnitario = ApplyVolumeDiscount(teja.PrecioBase, cantidadTejasConMerma);
        var subtotal = Math.Round(cantidadTejasConMerma * precioUnitario, 2);
        var pesoTotalCargaKg = Math.Round(cantidadTejasConMerma * teja.PesoKg, 2);
        var tipoCamion = SuggestTruck(pesoTotalCargaKg);
        var costoFlete = CalculateFreightCost(pesoTotalCargaKg, tipoCamion);
        var impuestoIva = Math.Round(subtotal * IvaRate, 2);
        var total = subtotal + impuestoIva + costoFlete;

        var pedido = new PedidoVenta
        {
            IdCliente = request.IdCliente,
            IdUsuario = idUsuario,
            FechaPedido = DateTime.UtcNow,
            Subtotal = subtotal,
            ImpuestoIva = impuestoIva,
            CostoFlete = costoFlete,
            Total = total,
            EstadoPedido = EstadoPedido.Cotizacion,
            Detalles =
            [
                new DetallePedido
                {
                    IdTeja = request.IdTeja,
                    CantidadSolicitada = cantidadTejasConMerma,
                    PrecioUnitarioAplicado = precioUnitario,
                    PendienteTechoGrados = request.GradosPendiente,
                    MetrosCuadradosCalculados = metrosCuadradosCalculados
                }
            ]
        };

        await _context.PedidosVenta.AddAsync(pedido, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return CotizacionResult.Created(new CotizacionResponse(
            pedido.IdPedido,
            request.IdCliente,
            request.IdTeja,
            teja.Modelo,
            request.MetrosBaseTecho,
            request.GradosPendiente,
            metrosCuadradosCalculados,
            cantidadTejasNeta,
            cantidadTejasConMerma,
            request.MargenMermaPorcentaje,
            pesoTotalCargaKg,
            Math.Round(pesoTotalCargaKg / 1000m, 2),
            tipoCamion.ToString(),
            precioUnitario,
            subtotal,
            costoFlete,
            impuestoIva,
            total));
    }

    private static string? ValidateRequest(CotizacionRequest request)
    {
        if (request.IdCliente <= 0)
        {
            return "El cliente especificado no es valido.";
        }

        if (request.IdTeja <= 0)
        {
            return "La teja especificada no es valida.";
        }

        if (request.MetrosBaseTecho <= 0)
        {
            return "Los metros cuadrados base del techo deben ser mayores que cero.";
        }

        if (request.GradosPendiente < 0 || request.GradosPendiente >= 90)
        {
            return "La pendiente debe estar entre 0 y menos de 90 grados.";
        }

        if (request.MargenMermaPorcentaje < 0 || request.MargenMermaPorcentaje > 25)
        {
            return "El margen de merma debe estar entre 0% y 25%.";
        }

        return null;
    }

    private static decimal CalculateRoofSurface(decimal baseArea, decimal slopeDegrees)
    {
        var radians = (double)slopeDegrees * Math.PI / 180d;
        var surface = (double)baseArea / Math.Cos(radians);
        return Math.Round((decimal)surface, 2);
    }

    private static decimal CalculateTileCoverage(ProductoTeja teja)
    {
        var coverage = (teja.LongitudCm / 100m) * (teja.AnchoCm / 100m);
        return coverage <= 0 ? throw new InvalidOperationException("La cobertura de la teja debe ser mayor que cero.") : coverage;
    }

    private static int ApplyWasteMargin(int quantity, decimal wasteMarginPercentage)
    {
        return (int)Math.Ceiling(quantity * (1 + wasteMarginPercentage / 100m));
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

    private static TipoCamion SuggestTruck(decimal totalWeightKg)
    {
        return totalWeightKg switch
        {
            <= 1200m => TipoCamion.Pickup,
            <= 3500m => TipoCamion.TresYMedia,
            <= 12000m => TipoCamion.Torton,
            <= 25000m => TipoCamion.Plataforma,
            _ => TipoCamion.Grua
        };
    }

    private static decimal CalculateFreightCost(decimal totalWeightKg, TipoCamion truck)
    {
        var baseCost = truck switch
        {
            TipoCamion.Pickup => 750m,
            TipoCamion.TresYMedia => 1400m,
            TipoCamion.Torton => 2500m,
            TipoCamion.Plataforma => 4200m,
            TipoCamion.Grua => 6500m,
            _ => 2500m
        };

        var variableCost = Math.Ceiling(totalWeightKg / 1000m) * 180m;
        return baseCost + variableCost;
    }
}

