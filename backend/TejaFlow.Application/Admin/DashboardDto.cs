namespace TejaFlow.Application.Admin;

public sealed record DashboardDto(
    decimal IngresoMesActual,
    int VentasMesActual,
    int PedidosPendientesEntrega,
    int AlertasReorden,
    decimal PerdidaMermaMesActual,
    IReadOnlyCollection<VentaMensualDto> VentasMensuales,
    IReadOnlyCollection<ModeloVendidoDto> ModelosMasVendidos,
    IReadOnlyCollection<PagoMetodoDto> PagosPorMetodo,
    IReadOnlyCollection<AlertaReordenDto> AlertasInventario,
    IReadOnlyCollection<MermaResumenDto> MermasRecientes);
