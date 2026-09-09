namespace TejaFlow.Application.Logistics;

public sealed record PedidoPendienteEntregaDto(
    int IdPedido,
    int IdCliente,
    string Cliente,
    string EstadoPedido,
    decimal Total,
    int CantidadSolicitada,
    int CantidadDespachada,
    int CantidadPendiente,
    IReadOnlyCollection<DetallePendienteEntregaDto> Detalles);
