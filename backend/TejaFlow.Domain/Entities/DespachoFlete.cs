using TejaFlow.Domain.Enums;

namespace TejaFlow.Domain.Entities;

public sealed class DespachoFlete
{
    public int IdDespacho { get; set; }
    public int IdPedido { get; set; }
    public int IdUsuario { get; set; }
    public TipoCamion TipoCamion { get; set; }
    public decimal PesoTotalCargaKg { get; set; }
    public string PlacasVehiculo { get; set; } = string.Empty;
    public string DireccionEntrega { get; set; } = string.Empty;
    public string IndicacionesDescarga { get; set; } = string.Empty;
    public DateTime? FechaSalida { get; set; }
    public DateTime? FechaEntregaReal { get; set; }
    public EstadoEntrega EstadoEntrega { get; set; } = EstadoEntrega.EnRuta;

    public PedidoVenta? Pedido { get; set; }
    public Usuario? Usuario { get; set; }
    public ICollection<RemisionParcial> Remisiones { get; set; } = [];
}
