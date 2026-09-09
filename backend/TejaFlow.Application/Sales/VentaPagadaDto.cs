namespace TejaFlow.Application.Sales;

public sealed record VentaPagadaDto(
    int IdPedido,
    int IdPago,
    string EstadoPedido,
    string MetodoPago,
    decimal Subtotal,
    decimal ImpuestoIva,
    decimal CostoFlete,
    decimal Total,
    decimal MontoPagado,
    IReadOnlyCollection<VentaDetalleDto> Detalles,
    IReadOnlyCollection<StockAfectadoDto> StockAfectado);

