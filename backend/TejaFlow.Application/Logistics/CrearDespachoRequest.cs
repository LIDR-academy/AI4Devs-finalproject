using TejaFlow.Domain.Enums;

namespace TejaFlow.Application.Logistics;

public sealed record CrearDespachoRequest(
    int IdPedido,
    TipoCamion TipoCamion,
    decimal PesoTotalCargaKg,
    string PlacasVehiculo,
    string DireccionEntrega,
    string IndicacionesDescarga,
    IReadOnlyCollection<CrearRemisionRequest> Remisiones);

