using Microsoft.EntityFrameworkCore;
using TejaFlow.Application.Breakage;

namespace TejaFlow.Tests;

public sealed class BreakageServiceTests
{
    [Fact]
    public async Task RegistrarMermaAsync_DeductsLotAndGlobalStockAndCreatesAuditRecords()
    {
        await using var context = TestDbContextFactory.Create();
        var usuario = TestDbContextFactory.CreateUsuario();
        var teja = TestDbContextFactory.CreateTeja();
        var lote = TestDbContextFactory.CreateLote(teja, cantidadActual: 100);

        context.Usuarios.Add(usuario);
        context.ProductosTeja.Add(teja);
        await context.SaveChangesAsync();

        var service = new BreakageService(context);

        var result = await service.RegistrarMermaAsync(
            new RegistrarMermaRequest(lote.IdLote, 12, "Rotura en descarga"),
            usuario.IdUsuario);

        Assert.True(result.Success);
        Assert.NotNull(result.Merma);
        Assert.Equal(88, result.Merma.StockLoteRestante);
        Assert.Equal(88, result.Merma.StockGlobalRestante);
        Assert.Equal("Rotura en descarga", result.Merma.Motivo);

        var savedLot = await context.LotesProduccion.SingleAsync();
        var savedTile = await context.ProductosTeja.SingleAsync();
        Assert.Equal(88, savedLot.CantidadActual);
        Assert.Equal(88, savedTile.StockGlobal);
        Assert.Single(context.MermasRotura);
        Assert.Single(context.MovimientosInventario);
    }

    [Fact]
    public async Task RegistrarMermaAsync_RejectsQuantityAboveAvailableStock()
    {
        await using var context = TestDbContextFactory.Create();
        var usuario = TestDbContextFactory.CreateUsuario();
        var teja = TestDbContextFactory.CreateTeja();
        var lote = TestDbContextFactory.CreateLote(teja, cantidadActual: 8);

        context.Usuarios.Add(usuario);
        context.ProductosTeja.Add(teja);
        await context.SaveChangesAsync();

        var service = new BreakageService(context);

        var result = await service.RegistrarMermaAsync(
            new RegistrarMermaRequest(lote.IdLote, 9, "Rotura en patio"),
            usuario.IdUsuario);

        Assert.False(result.Success);
        Assert.Contains("stock actual", result.Error, StringComparison.OrdinalIgnoreCase);
        Assert.Equal(8, (await context.LotesProduccion.SingleAsync()).CantidadActual);
        Assert.Empty(context.MermasRotura);
        Assert.Empty(context.MovimientosInventario);
    }
}
