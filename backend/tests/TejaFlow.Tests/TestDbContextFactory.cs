using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using TejaFlow.Domain.Entities;
using TejaFlow.Domain.Enums;
using TejaFlow.Infrastructure.Persistence;

namespace TejaFlow.Tests;

internal static class TestDbContextFactory
{
    public static TejaFlowDbContext Create()
    {
        var options = new DbContextOptionsBuilder<TejaFlowDbContext>()
            .UseInMemoryDatabase($"tejaflow-tests-{Guid.NewGuid():N}")
            .ConfigureWarnings(warnings => warnings.Ignore(InMemoryEventId.TransactionIgnoredWarning))
            .Options;

        return new TejaFlowDbContext(options);
    }

    public static Cliente CreateCliente(int idCliente = 1)
    {
        return new Cliente
        {
            IdCliente = idCliente,
            RazonSocial = $"Cliente Test {idCliente}",
            RfcNit = $"TEST{idCliente:000}",
            Email = $"cliente{idCliente}@tejaflow.test",
            Telefono = "6141000000",
            TipoCliente = "Mayorista",
            DireccionEntrega = "Direccion de prueba"
        };
    }

    public static Usuario CreateUsuario(int idUsuario = 1)
    {
        return new Usuario
        {
            IdUsuario = idUsuario,
            Nombre = $"Usuario Test {idUsuario}",
            Email = $"usuario{idUsuario}@tejaflow.test",
            Rol = RolUsuario.Admin,
            PasswordHash = "hash"
        };
    }

    public static ProductoTeja CreateTeja(
        int idTeja = 1,
        decimal precioBase = 20m,
        decimal pesoKg = 2m,
        int stockMinimo = 100)
    {
        var teja = new ProductoTeja
        {
            IdTeja = idTeja,
            Modelo = $"Teja Test {idTeja}",
            Material = MaterialTeja.Barro,
            Color = "Terracota",
            LongitudCm = 40m,
            AnchoCm = 25m,
            PesoKg = pesoKg,
            PrecioBase = precioBase,
            StockMinimo = stockMinimo
        };

        return teja;
    }

    public static LoteProduccion CreateLote(
        ProductoTeja teja,
        int idLote = 1,
        int cantidadActual = 500,
        DateTime? fechaEntrada = null)
    {
        var lote = new LoteProduccion
        {
            IdLote = idLote,
            IdTeja = teja.IdTeja,
            Teja = teja,
            CodigoLote = $"LOT-{idLote:000}",
            FechaEntrada = fechaEntrada ?? DateTime.UtcNow.AddDays(-idLote),
            CantidadInicial = cantidadActual,
            CantidadActual = cantidadActual
        };

        teja.Lotes.Add(lote);
        teja.RecalcularStockGlobal();

        return lote;
    }
}
