using Microsoft.EntityFrameworkCore;
using TejaFlow.Application.Common.Interfaces;
using TejaFlow.Domain.Entities;

namespace TejaFlow.Infrastructure.Persistence;

public sealed class TejaFlowDbContext : DbContext, ITejaFlowDbContext
{
    public TejaFlowDbContext(DbContextOptions<TejaFlowDbContext> options)
        : base(options)
    {
    }

    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<ProductoTeja> ProductosTeja => Set<ProductoTeja>();
    public DbSet<LoteProduccion> LotesProduccion => Set<LoteProduccion>();
    public DbSet<MermaRotura> MermasRotura => Set<MermaRotura>();
    public DbSet<Cliente> Clientes => Set<Cliente>();
    public DbSet<PedidoVenta> PedidosVenta => Set<PedidoVenta>();
    public DbSet<DetallePedido> DetallesPedido => Set<DetallePedido>();
    public DbSet<PagoVenta> PagosVenta => Set<PagoVenta>();
    public DbSet<DespachoFlete> DespachosFlete => Set<DespachoFlete>();
    public DbSet<RemisionParcial> RemisionesParciales => Set<RemisionParcial>();
    public DbSet<MovimientoInventario> MovimientosInventario => Set<MovimientoInventario>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(TejaFlowDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}

