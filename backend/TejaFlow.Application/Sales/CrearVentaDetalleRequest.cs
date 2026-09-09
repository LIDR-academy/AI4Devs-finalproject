namespace TejaFlow.Application.Sales;

public sealed record CrearVentaDetalleRequest(
    int IdTeja,
    int Cantidad,
    int? IdLote,
    decimal? PrecioUnitario,
    decimal PendienteTechoGrados,
    decimal MetrosCuadradosCalculados);

