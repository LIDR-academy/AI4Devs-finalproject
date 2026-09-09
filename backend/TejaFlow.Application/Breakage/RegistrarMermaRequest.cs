namespace TejaFlow.Application.Breakage;

public sealed record RegistrarMermaRequest(
    int IdLote,
    int CantidadRotas,
    string Motivo);

