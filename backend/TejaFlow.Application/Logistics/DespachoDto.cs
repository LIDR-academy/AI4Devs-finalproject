namespace TejaFlow.Application.Logistics;

public sealed record DespachoDto(
    int IdDespacho,
    int IdPedido,
    string EstadoPedido,
    string TipoCamion,
    decimal PesoTotalCargaKg,
    string PlacasVehiculo,
    string DireccionEntrega,
    string IndicacionesDescarga,
    DateTime? FechaSalida,
    string EstadoEntrega,
    IReadOnlyCollection<RemisionDto> Remisiones);

