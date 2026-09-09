namespace TejaFlow.Application.Admin;

public sealed record VentaMensualDto(
    int Anio,
    int Mes,
    string Periodo,
    decimal Total);
