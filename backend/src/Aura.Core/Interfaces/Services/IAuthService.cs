using Aura.Core.Models;

namespace Aura.Core.Interfaces.Services;

public interface IAuthService
{
    Task RequestMagicLinkAsync(string email, string magicLinkUrlTemplate);
    Task<(User User, string JwtToken)> VerifyMagicLinkAsync(string token);
    Task<string> RefreshTokenAsync(Guid userId);
    Task LogoutAsync(string jwtToken);
}
