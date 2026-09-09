namespace TejaFlow.Application.Sales;

public sealed record SalesResult(
    bool Success,
    string? Error,
    VentaPagadaDto? Venta)
{
    public static SalesResult Failed(string error)
    {
        return new SalesResult(false, error, null);
    }

    public static SalesResult Paid(VentaPagadaDto venta)
    {
        return new SalesResult(true, null, venta);
    }
}

