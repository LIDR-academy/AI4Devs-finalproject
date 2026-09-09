using TejaFlow.Domain.Enums;

namespace TejaFlow.Domain.Entities;

public sealed class MovimientoInventario
{
    public int IdMovimiento { get; set; }
    public int IdLote { get; set; }
    public int? IdPedido { get; set; }
    public int? IdMerma { get; set; }
    public int IdUsuario { get; set; }
    public TipoMovimientoInventario TipoMovimiento { get; set; }
    public int Cantidad { get; set; }
    public DateTime FechaMovimiento { get; set; }
    public string Referencia { get; set; } = string.Empty;

    public LoteProduccion? Lote { get; set; }
    public PedidoVenta? Pedido { get; set; }
    public MermaRotura? Merma { get; set; }
    public Usuario? Usuario { get; set; }
}

