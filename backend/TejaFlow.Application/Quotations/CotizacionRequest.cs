namespace TejaFlow.Application.Quotations;

public sealed record CotizacionRequest(
    int IdCliente,
    int IdTeja,
    decimal MetrosBaseTecho,
    decimal GradosPendiente,
    decimal MargenMermaPorcentaje = 10m);

