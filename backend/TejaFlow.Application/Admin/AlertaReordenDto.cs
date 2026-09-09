namespace TejaFlow.Application.Admin;

public sealed record AlertaReordenDto(
    int IdTeja,
    string Modelo,
    string Material,
    string Color,
    int StockGlobal,
    int StockMinimo,
    decimal PrecioBase);
