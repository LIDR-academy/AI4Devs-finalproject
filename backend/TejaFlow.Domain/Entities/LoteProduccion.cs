namespace TejaFlow.Domain.Entities;

public sealed class LoteProduccion
{
    public int IdLote { get; set; }
    public int IdTeja { get; set; }
    public string CodigoLote { get; set; } = string.Empty;
    public DateTime FechaEntrada { get; set; }
    public int CantidadInicial { get; set; }
    public int CantidadActual { get; set; }

    public ProductoTeja? Teja { get; set; }
    public ICollection<MermaRotura> Mermas { get; set; } = [];
    public ICollection<MovimientoInventario> Movimientos { get; set; } = [];

    public void DescontarStock(int cantidad)
    {
        if (cantidad <= 0)
        {
            throw new InvalidOperationException("La cantidad a descontar debe ser mayor que cero.");
        }

        if (cantidad > CantidadActual)
        {
            throw new InvalidOperationException("No se puede descontar mas stock del disponible en el lote.");
        }

        CantidadActual -= cantidad;
    }
}
