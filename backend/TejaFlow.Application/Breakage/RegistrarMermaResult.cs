namespace TejaFlow.Application.Breakage;

public sealed record RegistrarMermaResult(
    bool Success,
    string? Error,
    MermaRegistradaDto? Merma)
{
    public static RegistrarMermaResult Failed(string error)
    {
        return new RegistrarMermaResult(false, error, null);
    }

    public static RegistrarMermaResult Created(MermaRegistradaDto merma)
    {
        return new RegistrarMermaResult(true, null, merma);
    }
}

