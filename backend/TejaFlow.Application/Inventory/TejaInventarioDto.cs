namespace TejaFlow.Application.Inventory;

public sealed record TejaInventarioDto(
    int IdTeja,
    string Modelo,
    string Material,
    string Color,
    decimal LongitudCm,
    decimal AnchoCm,
    decimal PesoKg,
    decimal PrecioBase,
    int StockGlobal,
    int StockMinimo,
    bool RequiereReorden,
    IReadOnlyCollection<LoteInventarioDto> Lotes);

