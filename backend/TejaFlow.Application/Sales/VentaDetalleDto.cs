namespace TejaFlow.Application.Sales;

public sealed record VentaDetalleDto(
    int IdDetalle,
    int IdTeja,
    string ModeloTeja,
    int CantidadSolicitada,
    decimal PrecioUnitarioAplicado,
    decimal Subtotal);

