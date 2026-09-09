namespace TejaFlow.Application.Logistics;

public sealed record DetallePendienteEntregaDto(
    int IdDetallePedido,
    int IdTeja,
    string ModeloTeja,
    int CantidadSolicitada,
    int CantidadDespachada,
    int CantidadPendiente);
