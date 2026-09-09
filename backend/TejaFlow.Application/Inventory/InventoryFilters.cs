using TejaFlow.Domain.Enums;

namespace TejaFlow.Application.Inventory;

public sealed record InventoryFilters(
    MaterialTeja? Material,
    string? Color,
    bool? SoloBajoStock);

