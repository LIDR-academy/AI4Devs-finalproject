namespace Aura.Core.DTOs.Guests;

public record ImportResult(
    int Total,
    int Imported,
    int Skipped,
    List<ImportError> Errors
);

public record ImportError(
    int Row,
    string Field,
    string Message
);
