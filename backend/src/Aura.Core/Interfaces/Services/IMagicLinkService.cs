namespace Aura.Core.Interfaces.Services;

public interface IMagicLinkService
{
    string GenerateToken();
    string HashToken(string token);
    bool VerifyToken(string token, string hashedToken);
}
