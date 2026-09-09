using TejaFlow.Domain.Enums;

namespace TejaFlow.Application.Sales;

public sealed record PagarPedidoRequest(
    MetodoPago MetodoPago,
    decimal Monto,
    string? ReferenciaPago = null);

