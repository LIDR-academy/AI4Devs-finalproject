namespace TejaFlow.Application.Admin;

public sealed record PagoMetodoDto(
    string MetodoPago,
    int CantidadPagos,
    decimal TotalPagado);
