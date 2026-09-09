namespace TejaFlow.Domain.Entities;

public sealed class DetallePedido
{
    public int IdDetalle { get; set; }
    public int IdPedido { get; set; }
    public int IdTeja { get; set; }
    public int CantidadSolicitada { get; set; }
    public int CantidadDespachada { get; set; }
    public decimal PrecioUnitarioAplicado { get; set; }
    public decimal PendienteTechoGrados { get; set; }
    public decimal MetrosCuadradosCalculados { get; set; }
    public decimal Subtotal => CantidadSolicitada * PrecioUnitarioAplicado;
    public int CantidadPendiente => CantidadSolicitada - CantidadDespachada;

    public PedidoVenta? Pedido { get; set; }
    public ProductoTeja? Teja { get; set; }
    public ICollection<RemisionParcial> Remisiones { get; set; } = [];

    public void RegistrarDespacho(int cantidad)
    {
        if (cantidad <= 0)
        {
            throw new InvalidOperationException("La cantidad despachada debe ser mayor que cero.");
        }

        if (cantidad > CantidadPendiente)
        {
            throw new InvalidOperationException("La cantidad despachada no puede exceder el saldo pendiente.");
        }

        CantidadDespachada += cantidad;
    }
}
