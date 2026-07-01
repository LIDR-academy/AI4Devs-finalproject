using System.Security.Cryptography;
using System.Text;
using Aura.Core.Interfaces.Services;

namespace Aura.Core.Services;

public class MagicLinkService : IMagicLinkService
{
    public string GenerateToken()
    {
        var bytes = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(bytes);
        return Convert.ToBase64String(bytes).Replace('+', '-').Replace('/', '_').TrimEnd('=');
    }

    public string HashToken(string token)
    {
        using var sha256 = SHA256.Create();
        var hashBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(token));
        return Convert.ToBase64String(hashBytes);
    }

    public bool VerifyToken(string token, string hashedToken)
    {
        if (string.IsNullOrEmpty(token) || string.IsNullOrEmpty(hashedToken)) return false;
        
        var newlyHashed = HashToken(token);
        var newlyHashedBytes = Encoding.UTF8.GetBytes(newlyHashed);
        var storedHashedBytes = Encoding.UTF8.GetBytes(hashedToken);

        if (newlyHashedBytes.Length != storedHashedBytes.Length)
        {
            return false;
        }

        return CryptographicOperations.FixedTimeEquals(newlyHashedBytes, storedHashedBytes);
    }
}
