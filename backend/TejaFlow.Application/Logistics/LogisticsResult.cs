namespace TejaFlow.Application.Logistics;

public sealed record LogisticsResult(
    bool Success,
    string? Error,
    DespachoDto? Despacho)
{
    public static LogisticsResult Failed(string error)
    {
        return new LogisticsResult(false, error, null);
    }

    public static LogisticsResult Created(DespachoDto despacho)
    {
        return new LogisticsResult(true, null, despacho);
    }
}

