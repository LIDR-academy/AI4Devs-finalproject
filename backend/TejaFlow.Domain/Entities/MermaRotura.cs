namespace TejaFlow.Domain.Entities;

public sealed class MermaRotura
{
    public int IdMerma { get; set; }
    public int IdLote { get; set; }
    public int IdUsuario { get; set; }
    public int CantidadRotas { get; set; }
    public DateTime FechaRegistro { get; set; }
    public string Motivo { get; set; } = string.Empty;

    public LoteProduccion? Lote { get; set; }
    public Usuario? Usuario { get; set; }
    public ICollection<MovimientoInventario> Movimientos { get; set; } = [];
}
