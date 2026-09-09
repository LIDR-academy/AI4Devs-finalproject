using TejaFlow.Domain.Enums;

namespace TejaFlow.Domain.Entities;

public sealed class PagoVenta
{
    public int IdPago { get; set; }
    public int IdPedido { get; set; }
    public MetodoPago MetodoPago { get; set; }
    public EstadoPago EstadoPago { get; set; } = EstadoPago.Pendiente;
    public decimal Monto { get; set; }
    public DateTime FechaPago { get; set; }
    public string Referencia { get; set; } = string.Empty;

    public PedidoVenta? Pedido { get; set; }

    public void MarcarPagado()
    {
        if (Monto <= 0)
        {
            throw new InvalidOperationException("El pago debe tener un monto mayor que cero.");
        }

        EstadoPago = EstadoPago.Pagado;
        FechaPago = DateTime.UtcNow;
    }
}

