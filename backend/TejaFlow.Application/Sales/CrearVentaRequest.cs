using TejaFlow.Domain.Enums;

namespace TejaFlow.Application.Sales;

public sealed record CrearVentaRequest(
    int IdCliente,
    IReadOnlyCollection<CrearVentaDetalleRequest> Detalles,
    MetodoPago MetodoPago,
    decimal MontoPagado,
    decimal CostoFlete = 0m,
    string? ReferenciaPago = null);

