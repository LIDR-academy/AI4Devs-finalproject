using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using InkLink.Api.Domain.Entities;
using InkLink.Api.Domain.Enums;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace InkLink.Api.Infrastructure.Security;

public interface IJwtTokenGenerator
{
    /// <summary>Generates a signed JWT for the user. Includes artist_profile_id claim when the user is an artist.</summary>
    (string Token, DateTime ExpiresAt) GenerateToken(User user, Guid? artistProfileId);
}

public class JwtTokenGenerator : IJwtTokenGenerator
{
    private readonly JwtSettings _settings;

    public JwtTokenGenerator(IOptions<JwtSettings> settings)
    {
        _settings = settings.Value;
    }

    public (string Token, DateTime ExpiresAt) GenerateToken(User user, Guid? artistProfileId)
    {
        if (string.IsNullOrWhiteSpace(_settings.Secret))
        {
            throw new InvalidOperationException("JWT secret is not configured (Jwt:Secret)");
        }

        var expiresAt = DateTime.UtcNow.AddHours(_settings.ExpirationHours);
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new("user_id", user.Id.ToString()),
            new("email", user.Email),
            new("role", user.Role.ToString().ToLowerInvariant()),
            new("first_name", user.FirstName)
        };

        if (user.Role == UserRole.Artist && artistProfileId.HasValue)
        {
            claims.Add(new Claim("artist_profile_id", artistProfileId.Value.ToString()));
        }

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_settings.Secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer: _settings.Issuer,
            audience: _settings.Audience,
            claims: claims,
            notBefore: DateTime.UtcNow,
            expires: expiresAt,
            signingCredentials: credentials);

        return (new JwtSecurityTokenHandler().WriteToken(token), expiresAt);
    }
}
