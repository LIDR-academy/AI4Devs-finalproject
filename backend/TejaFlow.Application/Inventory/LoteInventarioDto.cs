namespace TejaFlow.Application.Inventory;

public sealed record LoteInventarioDto(
    int IdLote,
    string CodigoLote,
    DateTime FechaEntrada,
    int CantidadInicial,
    int CantidadActual);

