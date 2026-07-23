using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using Aura.Core.DTOs.Accomplices;
using Aura.Core.Exceptions;
using Aura.Core.Interfaces.Repositories;
using Aura.Core.Interfaces.Services;
using Aura.Core.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;

namespace Aura.Core.Services;

public class AccompliceService : IAccompliceService
{
    private readonly IAccompliceRepository _accompliceRepository;
    private readonly IEventRepository _eventRepository;
    private readonly IMagicLinkService _magicLinkService;
    private readonly IQueueService _queueService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AccompliceService> _logger;

    public AccompliceService(
        IAccompliceRepository accompliceRepository,
        IEventRepository eventRepository,
        IMagicLinkService magicLinkService,
        IQueueService queueService,
        IConfiguration configuration,
        ILogger<AccompliceService> logger)
    {
        _accompliceRepository = accompliceRepository;
        _eventRepository = eventRepository;
        _magicLinkService = magicLinkService;
        _queueService = queueService;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<AccompliceResponse> GrantAccessAsync(string eventSlug, GrantAccessRequest request, CancellationToken cancellationToken = default)
    {
        var @event = await _eventRepository.GetBySlugAsync(eventSlug);
        if (@event == null)
            throw new NotFoundException($"Event with slug {eventSlug} not found.");

        var token = _magicLinkService.GenerateToken();
        var hashedToken = _magicLinkService.HashToken(token);
        var expiresAt = @event.EventDate.AddDays(1); // Expires EventDate + 1 day

        var accomplice = new Accomplice
        {
            EventId = @event.Id,
            Email = request.Email,
            TokenHash = hashedToken,
            Permissions = JsonSerializer.Serialize(request.Permissions),
            ExpiresAt = expiresAt,
            GrantedAt = DateTimeOffset.UtcNow,
            IsRevoked = false
        };

        await _accompliceRepository.AddAsync(accomplice, cancellationToken);

        await EnqueueMagicLinkEmailAsync(accomplice.Email, token, cancellationToken);

        return MapToResponse(accomplice);
    }

    public async Task RevokeAccessAsync(Guid accompliceId, CancellationToken cancellationToken = default)
    {
        var accomplice = await _accompliceRepository.GetByIdAsync(accompliceId, cancellationToken);
        if (accomplice == null)
            throw new NotFoundException($"Accomplice not found.");

        accomplice.IsRevoked = true;
        await _accompliceRepository.UpdateAsync(accomplice, cancellationToken);
    }

    public async Task ResendMagicLinkAsync(Guid accompliceId, CancellationToken cancellationToken = default)
    {
        var accomplice = await _accompliceRepository.GetByIdAsync(accompliceId, cancellationToken);
        if (accomplice == null)
            throw new NotFoundException($"Accomplice not found.");

        if (accomplice.IsRevoked)
            throw new InvalidOperationException("Cannot resend magic link to a revoked accomplice.");

        var token = _magicLinkService.GenerateToken();
        accomplice.TokenHash = _magicLinkService.HashToken(token);
        
        await _accompliceRepository.UpdateAsync(accomplice, cancellationToken);

        await EnqueueMagicLinkEmailAsync(accomplice.Email, token, cancellationToken);
    }

    public async Task<IEnumerable<AccompliceResponse>> GetAccomplicesByEventAsync(string eventSlug, CancellationToken cancellationToken = default)
    {
        var @event = await _eventRepository.GetBySlugAsync(eventSlug);
        if (@event == null)
            throw new NotFoundException($"Event with slug {eventSlug} not found.");

        var accomplices = await _accompliceRepository.GetAccomplicesByEventAsync(@event.Id, cancellationToken);
        return accomplices.Select(MapToResponse);
    }

    public async Task<string> VerifyTokenAsync(string token, CancellationToken cancellationToken = default)
    {
        var hashedToken = _magicLinkService.HashToken(token);
        var accomplice = await _accompliceRepository.GetByTokenAsync(hashedToken, cancellationToken);

        if (accomplice == null || accomplice.IsRevoked || accomplice.ExpiresAt < DateTimeOffset.UtcNow)
        {
            throw new UnauthorizedAccessException("Access has expired or is invalid.");
        }

        accomplice.LastAccessedAt = DateTimeOffset.UtcNow;
        await _accompliceRepository.UpdateAsync(accomplice, cancellationToken);

        return GenerateAccompliceJwt(accomplice);
    }

    private string GenerateAccompliceJwt(Accomplice accomplice)
    {
        var keyStr = _configuration["Jwt:Key"] ?? "super_secret_key_that_is_at_least_32_bytes_long_which_we_need_for_hs256";
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyStr));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, accomplice.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, accomplice.Email),
            new Claim(ClaimTypes.Role, "accomplice"),
            new Claim("eventId", accomplice.EventId.ToString())
        };

        try
        {
            var permissions = JsonSerializer.Deserialize<List<string>>(accomplice.Permissions) ?? new List<string>();
            foreach (var perm in permissions)
            {
                claims.Add(new Claim("permissions", perm));
            }
        }
        catch
        {
            // fallback if it fails
        }

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"] ?? "Aura",
            audience: _configuration["Jwt:Audience"] ?? "AuraApp",
            claims: claims,
            expires: DateTime.UtcNow.AddHours(24),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private async Task EnqueueMagicLinkEmailAsync(string email, string token, CancellationToken cancellationToken)
    {
        var frontendUrl = _configuration["FrontendBaseUrl"] ?? "http://localhost:4200";
        var magicLink = $"{frontendUrl}/accomplice/{token}";
        
        var payload = new
        {
            To = email,
            Template = "accomplice-invite",
            Data = new { magicLink }
        };

        var messageJson = JsonSerializer.Serialize(payload);
        await _queueService.EnqueueAsync("email:queue", messageJson, cancellationToken);
    }

    public async Task<AccompliceMeResponse> GetMeAsync(Guid accompliceId, CancellationToken cancellationToken = default)
    {
        var accomplice = await _accompliceRepository.GetByIdAsync(accompliceId, cancellationToken);
        if (accomplice == null)
            throw new NotFoundException($"Accomplice not found.");

        var @event = await _eventRepository.GetByIdAsync(accomplice.EventId, cancellationToken);
        if (@event == null)
            throw new NotFoundException($"Event not found.");

        var perms = new List<string>();
        try
        {
            perms = JsonSerializer.Deserialize<List<string>>(accomplice.Permissions) ?? new List<string>();
        }
        catch { }

        return new AccompliceMeResponse
        {
            Id = accomplice.Id,
            Email = accomplice.Email,
            Permissions = perms,
            EventSlug = @event.Slug
        };
    }

    private AccompliceResponse MapToResponse(Accomplice accomplice)
    {
        var perms = new List<string>();
        try
        {
            perms = JsonSerializer.Deserialize<List<string>>(accomplice.Permissions) ?? new List<string>();
        }
        catch { }

        return new AccompliceResponse
        {
            Id = accomplice.Id,
            Email = accomplice.Email,
            Permissions = perms,
            GrantedAt = accomplice.GrantedAt,
            LastAccessedAt = accomplice.LastAccessedAt,
            IsRevoked = accomplice.IsRevoked
        };
    }
}
