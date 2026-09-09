using Microsoft.EntityFrameworkCore;
using TejaFlow.Application.Quotations;
using TejaFlow.Domain.Enums;

namespace TejaFlow.Tests;

public sealed class QuotationServiceTests
{
    [Fact]
    public async Task CreateQuotationAsync_CalculatesRoofSurfaceWasteWeightFreightAndTotals()
    {
        await using var context = TestDbContextFactory.Create();
        var cliente = TestDbContextFactory.CreateCliente();
        var teja = TestDbContextFactory.CreateTeja(precioBase: 20m, pesoKg: 2m);

        context.Clientes.Add(cliente);
        context.ProductosTeja.Add(teja);
        await context.SaveChangesAsync();

        var service = new QuotationService(context);

        var result = await service.CreateQuotationAsync(
            new CotizacionRequest(cliente.IdCliente, teja.IdTeja, 100m, 0m, 10m),
            idUsuario: 7);

        Assert.True(result.Success);
        Assert.NotNull(result.Cotizacion);
        Assert.Equal(100m, result.Cotizacion.MetrosCuadradosCalculados);
        Assert.Equal(1000, result.Cotizacion.CantidadTejasNeta);
        Assert.Equal(1100, result.Cotizacion.CantidadTejasConMerma);
        Assert.Equal(19m, result.Cotizacion.PrecioUnitarioAplicado);
        Assert.Equal(20900m, result.Cotizacion.Subtotal);
        Assert.Equal(3344m, result.Cotizacion.ImpuestoIva);
        Assert.Equal(2200m, result.Cotizacion.PesoTotalCargaKg);
        Assert.Equal(TipoCamion.TresYMedia.ToString(), result.Cotizacion.TipoCamionSugerido);
        Assert.Equal(1940m, result.Cotizacion.CostoFlete);
        Assert.Equal(26184m, result.Cotizacion.Total);

        var savedOrder = await context.PedidosVenta.SingleAsync();
        Assert.Equal(EstadoPedido.Cotizacion, savedOrder.EstadoPedido);
    }

    [Fact]
    public async Task CreateQuotationAsync_RejectsPhysicallyInvalidSlope()
    {
        await using var context = TestDbContextFactory.Create();
        var service = new QuotationService(context);

        var result = await service.CreateQuotationAsync(
            new CotizacionRequest(1, 1, 100m, 90m, 10m),
            idUsuario: 7);

        Assert.False(result.Success);
        Assert.Contains("pendiente", result.Error, StringComparison.OrdinalIgnoreCase);
        Assert.Empty(context.PedidosVenta);
    }
}
