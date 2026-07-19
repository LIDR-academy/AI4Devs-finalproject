using System.Net;
using System.Net.Http.Json;
using InkLink.Api.Application.Dtos;
using InkLink.Api.Domain.Entities;
using InkLink.Api.Domain.Enums;
using InkLink.Api.Domain.Services;
using InkLink.Api.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using Testcontainers.PostgreSql;

namespace InkLink.Api.Tests;

public class ShowcaseTests : IAsyncLifetime
{
    // Plaza de Armas, Santiago — reference point for distance assertions
    private const double RefLat = -33.4372;
    private const double RefLng = -70.6506;

    private readonly PostgreSqlContainer _postgres = new PostgreSqlBuilder("postgis/postgis:16-3.4")
        .WithDatabase("inklink_test")
        .WithUsername("inklink")
        .WithPassword("inklink_test_password")
        .Build();

    private Guid _nearArtistId;
    private Guid _midArtistId;
    private Guid _farArtistId;
    private Guid _unpublishedArtistId;

    public async Task InitializeAsync()
    {
        await _postgres.StartAsync();
        await using var context = CreateContext();
        await context.Database.MigrateAsync();
        await SeedShowcaseDataAsync(context);
    }

    public Task DisposeAsync() => _postgres.DisposeAsync().AsTask();

    private InkLinkDbContext CreateContext()
    {
        var dataSource = new NpgsqlDataSourceBuilder(_postgres.GetConnectionString())
            .EnableDynamicJson()
            .Build();
        var options = new DbContextOptionsBuilder<InkLinkDbContext>()
            .UseNpgsql(dataSource)
            .UseSnakeCaseNamingConvention()
            .Options;
        return new InkLinkDbContext(options);
    }

    private ShowcaseService CreateService(InkLinkDbContext context) => new(context);

    [Fact]
    public async Task Without_Coordinates_Returns_Four_Sections_With_NearYou_Ordered_By_Rating()
    {
        await using var context = CreateContext();
        var response = await CreateService(context).GetShowcaseAsync(null, null, 12);

        Assert.Equal(
            new[] { "near_you", "top_rated", "popular_styles", "awarded_artists" },
            response.Sections.Select(s => s.Key).ToArray());
        Assert.All(response.Sections, s => Assert.False(string.IsNullOrWhiteSpace(s.Title)));

        // Fallback without geolocation: ordered by rating desc (far=5.0, mid=4.0, near=3.0)
        var nearYou = response.Sections.Single(s => s.Key == "near_you");
        Assert.Equal(
            new[] { _farArtistId, _midArtistId, _nearArtistId },
            nearYou.Items.Select(i => i.Artist.Id).ToArray());
    }

    [Fact]
    public async Task With_Coordinates_NearYou_Is_Ordered_By_Distance()
    {
        await using var context = CreateContext();
        var response = await CreateService(context).GetShowcaseAsync(RefLat, RefLng, 12);

        var nearYou = response.Sections.Single(s => s.Key == "near_you");
        Assert.Equal(
            new[] { _nearArtistId, _midArtistId, _farArtistId },
            nearYou.Items.Select(i => i.Artist.Id).ToArray());
    }

    [Fact]
    public async Task Unpublished_Artists_Never_Appear_In_Any_Section()
    {
        await using var context = CreateContext();
        var response = await CreateService(context).GetShowcaseAsync(RefLat, RefLng, 12);

        var allArtistIds = response.Sections
            .SelectMany(s => s.Items)
            .Select(i => i.Artist.Id)
            .ToList();
        Assert.NotEmpty(allArtistIds);
        Assert.DoesNotContain(_unpublishedArtistId, allArtistIds);
    }

    [Fact]
    public async Task Awarded_Section_Contains_Only_Artists_With_Awards()
    {
        await using var context = CreateContext();
        var response = await CreateService(context).GetShowcaseAsync(null, null, 12);

        var awarded = response.Sections.Single(s => s.Key == "awarded_artists");
        var awardedIds = awarded.Items.Select(i => i.Artist.Id).Distinct().ToList();
        Assert.Equal(new[] { _farArtistId }, awardedIds);
    }

    [Fact]
    public async Task ArtistCard_Exposes_Expected_Fields_And_No_Sensitive_Data()
    {
        await using var context = CreateContext();
        var response = await CreateService(context).GetShowcaseAsync(null, null, 12);

        var nearYou = response.Sections.Single(s => s.Key == "near_you");
        var certified = nearYou.Items.Single(i => i.Artist.Id == _farArtistId).Artist;
        Assert.Equal("Carla Fuentes", certified.ArtistName);
        Assert.Equal("carla-fuentes", certified.Slug);
        Assert.True(certified.IsCertified);
        Assert.Equal("studio", certified.ArtistType);
        Assert.Equal("Las Condes", certified.Commune);
        Assert.NotEmpty(certified.Styles);
        Assert.True(certified.MinSessionPrice > 0);
        Assert.True(certified.HourlyRate > 0);
        Assert.Equal(5.0m, certified.AverageRating);
        Assert.Single(certified.SponsorBadges);

        var uncertified = nearYou.Items.Single(i => i.Artist.Id == _nearArtistId).Artist;
        Assert.False(uncertified.IsCertified);
        Assert.Empty(uncertified.SponsorBadges);

        // Every item carries a portfolio image and its style slug
        Assert.All(nearYou.Items, i =>
        {
            Assert.False(string.IsNullOrWhiteSpace(i.ImageUrl));
            Assert.False(string.IsNullOrWhiteSpace(i.Style));
        });
    }

    [Fact]
    public async Task LimitPerSection_Caps_Items()
    {
        await using var context = CreateContext();
        var response = await CreateService(context).GetShowcaseAsync(null, null, 1);

        // popular_styles has its own fixed limit (one per style) — exclude from this check
        Assert.All(response.Sections.Where(s => s.Key != "popular_styles"),
            s => Assert.True(s.Items.Count <= 1));
    }

    [Fact]
    public async Task Endpoint_Is_Public_Returns_200_With_Sections_And_No_Emails()
    {
        await using var factory = new WebApplicationFactory<Program>()
            .WithWebHostBuilder(builder => builder.UseSetting(
                "ConnectionStrings:DefaultConnection", _postgres.GetConnectionString()));
        var client = factory.CreateClient();

        var httpResponse = await client.GetAsync("/api/showcase?lat=-33.4372&lng=-70.6506");

        Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
        var body = await httpResponse.Content.ReadAsStringAsync();
        Assert.DoesNotContain("@example.cl", body);

        var payload = await httpResponse.Content.ReadFromJsonAsync<ShowcaseResponse>();
        Assert.NotNull(payload);
        Assert.Equal(4, payload!.Sections.Count);
    }

    private async Task SeedShowcaseDataAsync(InkLinkDbContext context)
    {
        var now = DateTime.UtcNow;
        var blackwork = new TattooStyle { Id = Guid.NewGuid(), Name = "Blackwork", Slug = "blackwork" };
        var realismo = new TattooStyle { Id = Guid.NewGuid(), Name = "Realismo", Slug = "realismo" };
        context.TattooStyles.AddRange(blackwork, realismo);

        // Distances from Plaza de Armas: near ~0.3 km, mid ~5.3 km, far ~8.3 km
        _nearArtistId = AddArtist(context, now, "Ana", "Perez", "ana-perez", "Santiago",
            -33.4400m, -70.6500m, 3.0m, blackwork,
            certified: false, awarded: false, sponsored: false, published: true);
        _midArtistId = AddArtist(context, now, "Bruno", "Silva", "bruno-silva", "Ñuñoa",
            -33.4569m, -70.5977m, 4.0m, blackwork,
            certified: true, awarded: false, sponsored: false, published: true);
        _farArtistId = AddArtist(context, now, "Carla", "Fuentes", "carla-fuentes", "Las Condes",
            -33.4086m, -70.5670m, 5.0m, realismo,
            certified: true, awarded: true, sponsored: true, published: true);
        _unpublishedArtistId = AddArtist(context, now, "Diego", "Oculto", "diego-oculto", "Providencia",
            -33.4263m, -70.6197m, 5.0m, realismo,
            certified: false, awarded: true, sponsored: false, published: false);

        await context.SaveChangesAsync();
    }

    private static Guid AddArtist(
        InkLinkDbContext context, DateTime now, string first, string last, string slug,
        string commune, decimal lat, decimal lng, decimal rating, TattooStyle style,
        bool certified, bool awarded, bool sponsored, bool published)
    {
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = $"{slug}@example.cl",
            PasswordHash = "not-a-real-hash",
            Role = UserRole.Artist,
            FirstName = first,
            LastName = last,
            IsVerified = true,
            CreatedAt = now,
            UpdatedAt = now
        };
        var profile = new ArtistProfile
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Slug = slug,
            Bio = $"Artist bio for {slug}",
            YearsExperience = 5,
            ArtistType = certified ? ArtistType.Studio : ArtistType.Independent,
            Latitude = lat,
            Longitude = lng,
            Commune = commune,
            MinSessionPrice = 50000,
            HourlyRate = 40000,
            DepositPercentage = 30,
            CancellationPolicy = CancellationPolicy.Hours48,
            IsPublished = published,
            RatingAvg = rating,
            TotalReviews = 10
        };
        profile.ArtistStyles.Add(new ArtistStyle { ArtistProfileId = profile.Id, StyleId = style.Id });
        profile.PortfolioItems.Add(new PortfolioItem
        {
            Id = Guid.NewGuid(),
            ArtistProfileId = profile.Id,
            ImageUrl = $"http://localhost:9000/inklink-images/{slug}/work-01.jpg",
            ThumbnailUrl = $"http://localhost:9000/inklink-images/{slug}/work-01-thumb.jpg",
            StyleId = style.Id,
            IsFeatured = true,
            SortOrder = 0,
            CreatedAt = now
        });
        if (certified)
        {
            profile.Certifications.Add(new Certification
            {
                Id = Guid.NewGuid(),
                ArtistProfileId = profile.Id,
                Type = CertificationType.Sanitary,
                Name = "Resolución Sanitaria SEREMI RM",
                Issuer = "SEREMI de Salud RM",
                ValidUntil = DateOnly.FromDateTime(now.AddYears(1)),
                IsActive = true
            });
        }
        if (awarded)
        {
            profile.Awards.Add(new Award
            {
                Id = Guid.NewGuid(),
                ArtistProfileId = profile.Id,
                Title = "Best Realism",
                EventName = "Expo Tattoo Santiago",
                Year = 2025,
                Category = "realismo"
            });
        }
        if (sponsored)
        {
            profile.Sponsorships.Add(new Sponsorship
            {
                Id = Guid.NewGuid(),
                ArtistProfileId = profile.Id,
                BrandName = "Eternal Ink",
                BrandLogoUrl = "http://localhost:9000/inklink-images/brands/eternal-ink.png",
                RelationshipType = SponsorshipRelationType.Sponsored,
                IsActive = true
            });
        }

        context.Users.Add(user);
        context.ArtistProfiles.Add(profile);
        return profile.Id;
    }
}
