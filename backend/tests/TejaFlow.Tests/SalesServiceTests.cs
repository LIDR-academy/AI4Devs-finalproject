using Microsoft.EntityFrameworkCore;
using TejaFlow.Application.Sales;
using TejaFlow.Domain.Enums;

namespace TejaFlow.Tests;

public sealed class SalesServiceTests
{
    [Fact]
    public async Task CrearVentaPagadaAsync_CreatesPaidOrderPaymentAndInventoryMovement()
    {
        await using var context = TestDbContextFactory.Create();
        var cliente = TestDbContextFactory.CreateCliente();
        var usuario = TestDbContextFactory.CreateUsuario();
        var teja = TestDbContextFactory.CreateTeja(precioBase: 20m);
        var lote = TestDbContextFactory.CreateLote(teja, cantidadActual: 100);

        context.Clientes.Add(cliente);
        context.Usuarios.Add(usuario);
        context.ProductosTeja.Add(teja);
        await context.SaveChangesAsync();

        var service = new SalesService(context);

        var result = await service.CrearVentaPagadaAsync(
            new CrearVentaRequest(
                cliente.IdCliente,
                [
                    new CrearVentaDetalleRequest(
                        teja.IdTeja,
                        Cantidad: 10,
                        IdLote: lote.IdLote,
                        PrecioUnitario: 20m,
                        PendienteTechoGrados: 0m,
                        MetrosCuadradosCalculados: 1m)
                ],
                MetodoPago.TarjetaDebito,
                MontoPagado: 232m,
                CostoFlete: 0m,
                ReferenciaPago: "TEST-001"),
            usuario.IdUsuario);

        Assert.True(result.Success);
        Assert.NotNull(result.Venta);
        Assert.Equal(EstadoPedido.Pagado.ToString(), result.Venta.EstadoPedido);
        Assert.Equal(MetodoPago.TarjetaDebito.ToString(), result.Venta.MetodoPago);
        Assert.Equal(200m, result.Venta.Subtotal);
        Assert.Equal(32m, result.Venta.ImpuestoIva);
        Assert.Equal(232m, result.Venta.Total);
        Assert.Single(result.Venta.StockAfectado);
        Assert.Equal(90, result.Venta.StockAfectado.Single().StockLoteRestante);

        Assert.Equal(90, (await context.LotesProduccion.SingleAsync()).CantidadActual);
        Assert.Equal(90, (await context.ProductosTeja.SingleAsync()).StockGlobal);
        Assert.Single(context.PedidosVenta);
        Assert.Single(context.PagosVenta);
        Assert.Single(context.MovimientosInventario);
    }

    [Fact]
    public async Task CrearVentaPagadaAsync_RejectsWhenRequestedQuantityExceedsStock()
    {
        await using var context = TestDbContextFactory.Create();
        var cliente = TestDbContextFactory.CreateCliente();
        var usuario = TestDbContextFactory.CreateUsuario();
        var teja = TestDbContextFactory.CreateTeja(precioBase: 20m);
        var lote = TestDbContextFactory.CreateLote(teja, cantidadActual: 5);

        context.Clientes.Add(cliente);
        context.Usuarios.Add(usuario);
        context.ProductosTeja.Add(teja);
        await context.SaveChangesAsync();

        var service = new SalesService(context);

        var result = await service.CrearVentaPagadaAsync(
            new CrearVentaRequest(
                cliente.IdCliente,
                [
                    new CrearVentaDetalleRequest(
                        teja.IdTeja,
                        Cantidad: 6,
                        IdLote: lote.IdLote,
                        PrecioUnitario: 20m,
                        PendienteTechoGrados: 0m,
                        MetrosCuadradosCalculados: 1m)
                ],
                MetodoPago.Efectivo,
                MontoPagado: 139.2m),
            usuario.IdUsuario);

        Assert.False(result.Success);
        Assert.Contains("stock suficiente", result.Error, StringComparison.OrdinalIgnoreCase);
        Assert.Equal(5, (await context.LotesProduccion.SingleAsync()).CantidadActual);
        Assert.Empty(context.PedidosVenta);
        Assert.Empty(context.PagosVenta);
        Assert.Empty(context.MovimientosInventario);
    }
}
