using TejaFlow.Domain.Enums;

namespace TejaFlow.Domain.Entities;

public sealed class ProductoTeja
{
    public int IdTeja { get; set; }
    public string Modelo { get; set; } = string.Empty;
    public MaterialTeja Material { get; set; }
    public string Color { get; set; } = string.Empty;
    public decimal LongitudCm { get; set; }
    public decimal AnchoCm { get; set; }
    public decimal PesoKg { get; set; }
    public decimal PrecioBase { get; set; }
    public int StockGlobal { get; private set; }
    public int StockMinimo { get; set; }

    public ICollection<LoteProduccion> Lotes { get; set; } = [];
    public ICollection<DetallePedido> DetallesPedido { get; set; } = [];

    public bool RequiereReorden => StockGlobal <= StockMinimo;

    public void RecalcularStockGlobal()
    {
        StockGlobal = Lotes.Sum(lote => lote.CantidadActual);
    }

    public void ActualizarStockGlobal(int stockGlobal)
    {
        if (stockGlobal < 0)
        {
            throw new InvalidOperationException("El stock global no puede ser negativo.");
        }

        StockGlobal = stockGlobal;
    }
}
