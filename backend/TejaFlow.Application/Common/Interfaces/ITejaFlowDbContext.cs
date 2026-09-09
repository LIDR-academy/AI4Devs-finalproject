using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using TejaFlow.Domain.Entities;

namespace TejaFlow.Application.Common.Interfaces;

public interface ITejaFlowDbContext
{
    DbSet<Usuario> Usuarios { get; }
    DbSet<ProductoTeja> ProductosTeja { get; }
    DbSet<LoteProduccion> LotesProduccion { get; }
    DbSet<MermaRotura> MermasRotura { get; }
    DbSet<Cliente> Clientes { get; }
    DbSet<PedidoVenta> PedidosVenta { get; }
    DbSet<DetallePedido> DetallesPedido { get; }
    DbSet<PagoVenta> PagosVenta { get; }
    DbSet<DespachoFlete> DespachosFlete { get; }
    DbSet<RemisionParcial> RemisionesParciales { get; }
    DbSet<MovimientoInventario> MovimientosInventario { get; }
    DatabaseFacade Database { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}

