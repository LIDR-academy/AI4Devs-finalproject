namespace TejaFlow.Application.Quotations;

public sealed record CotizacionResult(
    bool Success,
    string? Error,
    CotizacionResponse? Cotizacion)
{
    public static CotizacionResult Failed(string error)
    {
        return new CotizacionResult(false, error, null);
    }

    public static CotizacionResult Created(CotizacionResponse cotizacion)
    {
        return new CotizacionResult(true, null, cotizacion);
    }
}

