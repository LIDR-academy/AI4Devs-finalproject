namespace TejaFlow.Application.Logistics;

public sealed record CrearRemisionRequest(
    int IdDetallePedido,
    int CantidadEnviada,
    string? FirmaRecibido = null);

