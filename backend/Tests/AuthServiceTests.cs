using System.IdentityModel.Tokens.Jwt;
using InkLink.Api.Application.Dtos;
using InkLink.Api.Domain.Entities;
using InkLink.Api.Domain.Enums;
using InkLink.Api.Domain.Services;
using InkLink.Api.Infrastructure.Data;
using InkLink.Api.Infrastructure.Security;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace InkLink.Api.Tests;

public class AuthServiceTests : IDisposable
{
    private const string TestSecret = "test-secret-key-for-unit-tests-256-bits-minimum!!";
    private const string ClientEmail = "client@test.cl";
    private const string ArtistEmail = "artist@test.cl";
    private const string CorrectPassword = "Test1234!";

    private readonly InkLinkDbContext _context;
    private readonly AuthService _service;
    private readonly Guid _artistProfileId = Guid.NewGuid();

    public AuthServiceTests()
    {
        var options = new DbContextOptionsBuilder<InkLinkDbContext>()
            .UseInMemoryDatabase($"auth-tests-{Guid.NewGuid()}")
            .Options;
        _context = new InkLinkDbContext(options);
        SeedUsers();

        var settings = Options.Create(new JwtSettings
        {
            Secret = TestSecret,
            Issuer = "inklink-api",
            Audience = "inklink-web",
            ExpirationHours = 24
        });
        _service = new AuthService(_context, new JwtTokenGenerator(settings));
    }

    public void Dispose() => _context.Dispose();

    private void SeedUsers()
    {
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(CorrectPassword);
        var client = new User
        {
            Id = Guid.NewGuid(),
            Email = ClientEmail,
            PasswordHash = passwordHash,
            Role = UserRole.Client,
            FirstName = "Camila",
            LastName = "Rojas",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        var artistUser = new User
        {
            Id = Guid.NewGuid(),
            Email = ArtistEmail,
            PasswordHash = passwordHash,
            Role = UserRole.Artist,
            FirstName = "Matías",
            LastName = "Herrera",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        var profile = new ArtistProfile
        {
            Id = _artistProfileId,
            UserId = artistUser.Id,
            Slug = "matias-herrera",
            Commune = "Providencia",
            ArtistType = ArtistType.Studio,
            CancellationPolicy = CancellationPolicy.Hours48,
            MinSessionPrice = 80000,
            HourlyRate = 60000,
            IsPublished = true
        };
        _context.Users.AddRange(client, artistUser);
        _context.ArtistProfiles.Add(profile);
        _context.SaveChanges();
    }

    [Fact]
    public async Task Login_WithValidCredentials_ReturnsTokenAndUser()
    {
        var response = await _service.LoginAsync(new LoginRequest(ClientEmail, CorrectPassword));

        Assert.NotNull(response);
        Assert.False(string.IsNullOrWhiteSpace(response.Token));
        Assert.Equal(ClientEmail, response.User.Email);
        Assert.Equal("client", response.User.Role);
        Assert.Null(response.User.ArtistProfileId);
    }

    [Fact]
    public async Task Login_WithWrongPassword_ReturnsNull()
    {
        var response = await _service.LoginAsync(new LoginRequest(ClientEmail, "WrongPassword1!"));

        Assert.Null(response);
    }

    [Fact]
    public async Task Login_WithUnknownEmail_ReturnsNull()
    {
        var response = await _service.LoginAsync(new LoginRequest("nobody@test.cl", CorrectPassword));

        Assert.Null(response);
    }

    [Fact]
    public async Task Login_IsCaseInsensitiveOnEmail()
    {
        var response = await _service.LoginAsync(new LoginRequest("CLIENT@TEST.CL", CorrectPassword));

        Assert.NotNull(response);
    }

    [Fact]
    public async Task Token_ContainsExpectedClaims()
    {
        var response = await _service.LoginAsync(new LoginRequest(ClientEmail, CorrectPassword));

        Assert.NotNull(response);
        var token = new JwtSecurityTokenHandler().ReadJwtToken(response.Token);
        Assert.Contains(token.Claims, c => c.Type == "user_id");
        Assert.Contains(token.Claims, c => c.Type == "email" && c.Value == ClientEmail);
        Assert.Contains(token.Claims, c => c.Type == "role" && c.Value == "client");
        Assert.Contains(token.Claims, c => c.Type == "first_name" && c.Value == "Camila");
        Assert.DoesNotContain(token.Claims, c => c.Type == "artist_profile_id");
    }

    [Fact]
    public async Task ArtistToken_IncludesArtistProfileId()
    {
        var response = await _service.LoginAsync(new LoginRequest(ArtistEmail, CorrectPassword));

        Assert.NotNull(response);
        Assert.Equal(_artistProfileId, response.User.ArtistProfileId);
        var token = new JwtSecurityTokenHandler().ReadJwtToken(response.Token);
        Assert.Contains(token.Claims,
            c => c.Type == "artist_profile_id" && c.Value == _artistProfileId.ToString());
    }

    [Fact]
    public async Task Token_ExpiresIn24Hours()
    {
        var before = DateTime.UtcNow;

        var response = await _service.LoginAsync(new LoginRequest(ClientEmail, CorrectPassword));

        Assert.NotNull(response);
        var expectedExpiry = before.AddHours(24);
        Assert.InRange(response.ExpiresAt, expectedExpiry.AddMinutes(-1), expectedExpiry.AddMinutes(1));
        var token = new JwtSecurityTokenHandler().ReadJwtToken(response.Token);
        Assert.InRange(token.ValidTo, expectedExpiry.AddMinutes(-1), expectedExpiry.AddMinutes(1));
    }
}
