namespace TejaFlow.Application.Admin;

public sealed record ModeloVendidoDto(
    int IdTeja,
    string ModeloTeja,
    int CantidadVendida,
    decimal TotalVendido);
