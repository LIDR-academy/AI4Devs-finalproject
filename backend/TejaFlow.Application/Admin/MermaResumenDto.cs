namespace TejaFlow.Application.Admin;

public sealed record MermaResumenDto(
    int IdMerma,
    string ModeloTeja,
    string CodigoLote,
    int CantidadRotas,
    decimal PerdidaEstimada,
    string Motivo,
    DateTime FechaRegistro);
