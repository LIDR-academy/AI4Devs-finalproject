namespace TejaFlow.Domain.Entities;

public sealed class RemisionParcial
{
    public int IdRemision { get; set; }
    public int IdDespacho { get; set; }
    public int IdDetallePedido { get; set; }
    public int CantidadEnviada { get; set; }
    public DateTime FechaRegistro { get; set; }
    public string FirmaRecibido { get; set; } = string.Empty;

    public DespachoFlete? Despacho { get; set; }
    public DetallePedido? DetallePedido { get; set; }
}

