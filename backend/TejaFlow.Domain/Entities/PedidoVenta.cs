using TejaFlow.Domain.Enums;

namespace TejaFlow.Domain.Entities;

public sealed class PedidoVenta
{
    public int IdPedido { get; set; }
    public int IdCliente { get; set; }
    public int IdUsuario { get; set; }
    public DateTime FechaPedido { get; set; }
    public decimal Subtotal { get; set; }
    public decimal ImpuestoIva { get; set; }
    public decimal CostoFlete { get; set; }
    public decimal Total { get; set; }
    public EstadoPedido EstadoPedido { get; set; } = EstadoPedido.Cotizacion;

    public Cliente? Cliente { get; set; }
    public Usuario? Usuario { get; set; }
    public ICollection<DetallePedido> Detalles { get; set; } = [];
    public ICollection<PagoVenta> Pagos { get; set; } = [];
    public ICollection<DespachoFlete> Despachos { get; set; } = [];
    public ICollection<MovimientoInventario> Movimientos { get; set; } = [];

    public void RecalcularTotales(decimal porcentajeIva)
    {
        Subtotal = Detalles.Sum(detalle => detalle.Subtotal);
        ImpuestoIva = Math.Round(Subtotal * porcentajeIva, 2);
        Total = Subtotal + ImpuestoIva + CostoFlete;
    }

    public void MarcarPagado()
    {
        EstadoPedido = EstadoPedido.Pagado;
    }

    public void ActualizarEstadoDespacho()
    {
        if (Detalles.Count == 0)
        {
            return;
        }

        var totalPendiente = Detalles.Sum(detalle => detalle.CantidadPendiente);
        EstadoPedido = totalPendiente == 0 ? EstadoPedido.Despachado : EstadoPedido.Parcial;
    }
}
