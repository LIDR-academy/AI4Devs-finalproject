using InkLink.Api.Application.Dtos;
using InkLink.Api.Infrastructure.Data;
using InkLink.Api.Infrastructure.Security;
using Microsoft.EntityFrameworkCore;

namespace InkLink.Api.Domain.Services;

public interface IAuthService
{
    /// <summary>Validates credentials. Returns null on any failure (generic — never reveals whether the email exists).</summary>
    Task<LoginResponse?> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default);
}

public class AuthService : IAuthService
{
    private readonly InkLinkDbContext _context;
    private readonly IJwtTokenGenerator _tokenGenerator;

    public AuthService(InkLinkDbContext context, IJwtTokenGenerator tokenGenerator)
    {
        _context = context;
        _tokenGenerator = tokenGenerator;
    }

    public async Task<LoginResponse?> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var user = await _context.Users
            .Include(u => u.ArtistProfile)
            .SingleOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail, cancellationToken);

        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return null;
        }

        var artistProfileId = user.ArtistProfile?.Id;
        var (token, expiresAt) = _tokenGenerator.GenerateToken(user, artistProfileId);

        var userSummary = new UserSummaryDto(
            user.Id,
            user.Email,
            user.FirstName,
            user.LastName,
            user.Role.ToString().ToLowerInvariant(),
            user.AvatarUrl,
            artistProfileId);

        return new LoginResponse(token, expiresAt, userSummary);
    }
}
