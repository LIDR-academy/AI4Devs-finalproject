namespace TejaFlow.Application.Quotations;

public sealed record CotizacionResponse(
    int IdPedido,
    int IdCliente,
    int IdTeja,
    string ModeloTeja,
    decimal MetrosBaseTecho,
    decimal GradosPendiente,
    decimal MetrosCuadradosCalculados,
    int CantidadTejasNeta,
    int CantidadTejasConMerma,
    decimal MargenMermaPorcentaje,
    decimal PesoTotalCargaKg,
    decimal PesoTotalCargaToneladas,
    string TipoCamionSugerido,
    decimal PrecioUnitarioAplicado,
    decimal Subtotal,
    decimal CostoFlete,
    decimal ImpuestoIva,
    decimal Total);

