namespace TejaFlow.Application.Logistics;

public sealed record RemisionDto(
    int IdRemision,
    int IdDetallePedido,
    int IdTeja,
    string ModeloTeja,
    int CantidadEnviada,
    int CantidadSolicitada,
    int CantidadDespachada,
    int CantidadPendiente,
    string FirmaRecibido,
    DateTime FechaRegistro);

