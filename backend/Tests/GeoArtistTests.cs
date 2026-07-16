using System.Globalization;
using System.Net;
using System.Net.Http.Json;
using InkLink.Api.Application.Dtos;
using InkLink.Api.Domain.Entities;
using InkLink.Api.Domain.Enums;
using InkLink.Api.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using Testcontainers.PostgreSql;

namespace InkLink.Api.Tests;

/// <summary>US0012 TASK0001 — Geo endpoint: ST_DWithin, radius, filters, limit.</summary>
public class GeoArtistTests : IAsyncLifetime
{
    private readonly PostgreSqlContainer _postgres = new PostgreSqlBuilder("postgis/postgis:16-3.4")
        .WithDatabase("inklink_geo_test")
        .WithUsername("inklink")
        .WithPassword("inklink_test_password")
        .Build();

    // Providencia: -33.4263, -70.6197  (origin for tests)
    private const decimal OriginLat = -33.4263m;
    private const decimal OriginLng = -70.6197m;

    // Ñuñoa: ~3 km from Providencia
    private const decimal NearLat = -33.4569m;
    private const decimal NearLng = -70.5977m;

    // Valparaíso: ~120 km from Santiago — always outside radius
    private const decimal FarLat = -33.0458m;
    private const decimal FarLng = -71.6197m;

    private Guid _nearArtistId;
    private Guid _farArtistId;
    private Guid _unpublishedArtistId;
    private Guid _certifiedNearId;

    public async Task InitializeAsync()
    {
        await _postgres.StartAsync();
        await using var context = CreateContext();
        await context.Database.MigrateAsync();
        await SeedDataAsync(context);
    }

    public Task DisposeAsync() => _postgres.DisposeAsync().AsTask();

    // --- Tests ---

    [Fact]
    public async Task Returns_Artists_Within_Radius()
    {
        await using var factory = CreateFactory();

        var response = await factory.CreateClient()
            .GetAsync(GeoUrl(OriginLat, OriginLng, 10));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<ArtistListResponse>();
        Assert.NotNull(body);
        Assert.Contains(body!.Data, a => a.Id == _nearArtistId);
        Assert.DoesNotContain(body.Data, a => a.Id == _farArtistId);
    }

    [Fact]
    public async Task Does_Not_Return_Artists_Outside_Radius()
    {
        await using var factory = CreateFactory();

        // 1 km radius — only catches artists within 1 km of origin
        var response = await factory.CreateClient()
            .GetAsync(GeoUrl(OriginLat, OriginLng, 1));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<ArtistListResponse>();
        Assert.DoesNotContain(body!.Data, a => a.Id == _nearArtistId);  // ~3 km away
        Assert.DoesNotContain(body!.Data, a => a.Id == _farArtistId);
    }

    [Fact]
    public async Task Does_Not_Return_Unpublished_Artists()
    {
        await using var factory = CreateFactory();

        var response = await factory.CreateClient()
            .GetAsync(GeoUrl(OriginLat, OriginLng, 50));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<ArtistListResponse>();
        Assert.DoesNotContain(body!.Data, a => a.Id == _unpublishedArtistId);
    }

    [Fact]
    public async Task Certified_Filter_Returns_Only_Certified()
    {
        await using var factory = CreateFactory();

        var response = await factory.CreateClient()
            .GetAsync(GeoUrl(OriginLat, OriginLng, 10) + "&certified=true");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<ArtistListResponse>();
        Assert.All(body!.Data, a => Assert.True(a.IsCertified));
        Assert.Contains(body.Data, a => a.Id == _certifiedNearId);
        Assert.DoesNotContain(body.Data, a => a.Id == _nearArtistId);
    }

    [Fact]
    public async Task Invalid_Lat_Returns_400()
    {
        await using var factory = CreateFactory();

        var response = await factory.CreateClient()
            .GetAsync("/api/artists/geo?lat=999&lng=-70.6&radiusKm=10");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    // --- Helpers ---

    private static string GeoUrl(decimal lat, decimal lng, int radiusKm) =>
        string.Format(CultureInfo.InvariantCulture,
            "/api/artists/geo?lat={0}&lng={1}&radiusKm={2}", lat, lng, radiusKm);

    private WebApplicationFactory<Program> CreateFactory() =>
        new WebApplicationFactory<Program>().WithWebHostBuilder(b =>
            b.UseSetting("ConnectionStrings:DefaultConnection", _postgres.GetConnectionString()));

    private InkLinkDbContext CreateContext()
    {
        var ds = new NpgsqlDataSourceBuilder(_postgres.GetConnectionString()).EnableDynamicJson().Build();
        return new InkLinkDbContext(
            new DbContextOptionsBuilder<InkLinkDbContext>()
                .UseNpgsql(ds)
                .UseSnakeCaseNamingConvention()
                .Options);
    }

    private async Task SeedDataAsync(InkLinkDbContext ctx)
    {
        var now = DateTime.UtcNow;

        var nearUser = MakeUser("near@test.cl", now);
        var farUser = MakeUser("far@test.cl", now);
        var unpubUser = MakeUser("unpub@test.cl", now);
        var certUser = MakeUser("cert@test.cl", now);

        var nearProfile = MakeProfile(nearUser.Id, "near-artist", NearLat, NearLng, true);
        var farProfile = MakeProfile(farUser.Id, "far-artist", FarLat, FarLng, true);
        var unpubProfile = MakeProfile(unpubUser.Id, "unpub-artist", NearLat, NearLng, false);
        var certProfile = MakeProfile(certUser.Id, "cert-artist", NearLat, NearLng, true);

        _nearArtistId = nearProfile.Id;
        _farArtistId = farProfile.Id;
        _unpublishedArtistId = unpubProfile.Id;
        _certifiedNearId = certProfile.Id;

        certProfile.Certifications.Add(new Certification
        {
            Id = Guid.NewGuid(),
            ArtistProfileId = certProfile.Id,
            Type = CertificationType.Sanitary,
            Name = "Resolución Sanitaria",
            Issuer = "SEREMI RM",
            ValidUntil = DateOnly.FromDateTime(now.AddYears(1)),
            IsActive = true
        });

        ctx.Users.AddRange(nearUser, farUser, unpubUser, certUser);
        ctx.ArtistProfiles.AddRange(nearProfile, farProfile, unpubProfile, certProfile);
        await ctx.SaveChangesAsync();
    }

    private static User MakeUser(string email, DateTime now) => new()
    {
        Id = Guid.NewGuid(),
        Email = email,
        PasswordHash = "irrelevant",
        Role = UserRole.Artist,
        FirstName = email.Split('@')[0],
        LastName = "Test",
        IsVerified = true,
        CreatedAt = now,
        UpdatedAt = now
    };

    private static ArtistProfile MakeProfile(
        Guid userId, string slug, decimal lat, decimal lng, bool published) => new()
    {
        Id = Guid.NewGuid(),
        UserId = userId,
        Slug = slug,
        ArtistType = ArtistType.Independent,
        Latitude = lat,
        Longitude = lng,
        Commune = "Santiago",
        MinSessionPrice = 50000,
        HourlyRate = 40000,
        DepositPercentage = 30,
        CancellationPolicy = CancellationPolicy.Hours48,
        IsPublished = published
    };
}
