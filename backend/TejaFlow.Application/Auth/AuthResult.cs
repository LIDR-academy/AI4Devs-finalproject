namespace TejaFlow.Application.Auth;

public sealed record AuthResult(
    int IdUsuario,
    string Nombre,
    string Email,
    string Rol,
    string AccessToken,
    DateTimeOffset ExpiresAt);

