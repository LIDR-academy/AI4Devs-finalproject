namespace TejaFlow.Application.Breakage;

public sealed record MermaRegistradaDto(
    int IdMerma,
    int IdLote,
    string CodigoLote,
    int IdTeja,
    int CantidadRotas,
    int StockLoteRestante,
    int StockGlobalRestante,
    string Motivo,
    DateTime FechaRegistro);

