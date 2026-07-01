using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Aura.Core.Enums;
using Aura.Core.Interfaces.Repositories;
using Aura.Core.Interfaces.Services;
using Aura.Core.Models;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace Aura.Core.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IMagicLinkService _magicLinkService;
    private readonly IEmailService _emailService;
    private readonly IConfiguration _configuration;
    private readonly IDistributedCache _cache;

    public AuthService(
        IUserRepository userRepository,
        IMagicLinkService magicLinkService,
        IEmailService emailService,
        IConfiguration configuration,
        IDistributedCache cache)
    {
        _userRepository = userRepository;
        _magicLinkService = magicLinkService;
        _emailService = emailService;
        _configuration = configuration;
        _cache = cache;
    }

    public async Task RequestMagicLinkAsync(string email, string magicLinkUrlTemplate)
    {
        var user = await _userRepository.GetByEmailAsync(email);
        if (user == null)
        {
            user = new User
            {
                Email = email,
                Name = email.Split('@')[0],
                Status = UserStatus.Pending
            };
            await _userRepository.AddAsync(user);
        }

        var token = _magicLinkService.GenerateToken();
        user.HashedMagicLinkToken = _magicLinkService.HashToken(token);
        user.TokenExpiresAt = DateTimeOffset.UtcNow.AddMinutes(15);
        
        await _userRepository.UpdateAsync(user);

        var magicLinkUrl = magicLinkUrlTemplate.Replace("{token}", token);
        await _emailService.SendMagicLinkAsync(email, magicLinkUrl);
    }

    public async Task<(User User, string JwtToken)> VerifyMagicLinkAsync(string token)
    {
        var hashedToken = _magicLinkService.HashToken(token);
        var user = await _userRepository.GetByHashedTokenAsync(hashedToken);

        if (user == null || user.TokenExpiresAt < DateTimeOffset.UtcNow)
        {
            throw new UnauthorizedAccessException("Link expired or invalid.");
        }

        if (!_magicLinkService.VerifyToken(token, user.HashedMagicLinkToken!))
        {
            throw new UnauthorizedAccessException("Link expired or invalid.");
        }

        // Clean up token
        user.HashedMagicLinkToken = null;
        user.TokenExpiresAt = null;
        user.LastLoginAt = DateTimeOffset.UtcNow;
        if (user.Status == UserStatus.Pending)
        {
            user.Status = UserStatus.Active;
        }

        await _userRepository.UpdateAsync(user);

        var jwtToken = GenerateJwtToken(user);
        return (user, jwtToken);
    }

    public async Task<string> RefreshTokenAsync(Guid userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null || user.Status != UserStatus.Active)
        {
            throw new UnauthorizedAccessException("User not found or inactive.");
        }

        return GenerateJwtToken(user);
    }

    public async Task LogoutAsync(string jwtToken)
    {
        var handler = new JwtSecurityTokenHandler();
        if (handler.CanReadToken(jwtToken))
        {
            var token = handler.ReadJwtToken(jwtToken);
            var expiry = token.ValidTo;
            var timeRemaining = expiry - DateTime.UtcNow;

            if (timeRemaining > TimeSpan.Zero)
            {
                var hash = _magicLinkService.HashToken(jwtToken);
                await _cache.SetStringAsync($"auth:blacklist:{hash}", "blacklisted", new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = timeRemaining
                });
            }
        }
    }

    private string GenerateJwtToken(User user)
    {
        var keyStr = _configuration["Jwt:Key"] ?? "super_secret_key_that_is_at_least_32_bytes_long_which_we_need_for_hs256";
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyStr));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(ClaimTypes.Role, "host"),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"] ?? "Aura",
            audience: _configuration["Jwt:Audience"] ?? "AuraApp",
            claims: claims,
            expires: DateTime.UtcNow.AddHours(24),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
