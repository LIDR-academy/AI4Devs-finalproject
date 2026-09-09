namespace TejaFlow.Application.Sales;

public sealed record StockAfectadoDto(
    int IdTeja,
    string ModeloTeja,
    int IdLote,
    string CodigoLote,
    int CantidadDescontada,
    int StockLoteRestante,
    int StockGlobalRestante);

