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

public class ArtistSearchTests : IAsyncLifetime
{
    private readonly PostgreSqlContainer _postgres = new PostgreSqlBuilder("postgis/postgis:16-3.4")
        .WithDatabase("inklink_artist_search_test")
        .WithUsername("inklink")
        .WithPassword("inklink_test_password")
        .Build();

    public async Task InitializeAsync()
    {
        await _postgres.StartAsync();
        await using var context = CreateContext();
        await context.Database.MigrateAsync();
        await SeedArtistsAsync(context);
    }

    public Task DisposeAsync() => _postgres.DisposeAsync().AsTask();

    [Fact]
    public async Task SearchByName_Returns_Matching_Artists()
    {
        await using var factory = CreateFactory();
        var client = factory.CreateClient();

        var payload = await client.GetFromJsonAsync<ArtistListResponse>("/api/artists?search=Alice");

        Assert.NotNull(payload);
        Assert.Contains(payload!.Data, a => a.Slug == "alice-black");
    }

    [Fact]
    public async Task SearchByCommune_Returns_Matching_Artists()
    {
        await using var factory = CreateFactory();
        var client = factory.CreateClient();

        var payload = await client.GetFromJsonAsync<ArtistListResponse>("/api/artists?search=Providencia");

        Assert.NotNull(payload);
        Assert.Contains(payload!.Data, a => a.Slug == "bruno-real");
    }

    [Fact]
    public async Task SearchByStyle_Returns_Matching_Artists()
    {
        await using var factory = CreateFactory();
        var client = factory.CreateClient();

        var payload = await client.GetFromJsonAsync<ArtistListResponse>("/api/artists?search=Fine");

        Assert.NotNull(payload);
        Assert.Contains(payload!.Data, a => a.Slug == "carla-fine");
    }

    [Fact]
    public async Task SearchCaseInsensitive_Works()
    {
        await using var factory = CreateFactory();
        var client = factory.CreateClient();

        var payload = await client.GetFromJsonAsync<ArtistListResponse>("/api/artists?search=ALICE");

        Assert.NotNull(payload);
        Assert.Contains(payload!.Data, a => a.Slug == "alice-black");
    }

    [Fact]
    public async Task Search_Combined_With_Other_Filters()
    {
        await using var factory = CreateFactory();
        var client = factory.CreateClient();

        var payload = await client.GetFromJsonAsync<ArtistListResponse>("/api/artists?search=Santiago&certified=true");

        Assert.NotNull(payload);
        Assert.Single(payload!.Data);
        Assert.Equal("alice-black", payload.Data[0].Slug);
    }

    [Fact]
    public async Task EmptySearch_Returns_All_Artists()
    {
        await using var factory = CreateFactory();
        var client = factory.CreateClient();

        var payload = await client.GetFromJsonAsync<ArtistListResponse>("/api/artists");

        Assert.NotNull(payload);
        Assert.Equal(5, payload!.Total);
    }

    [Fact]
    public async Task Suggestions_MinLength_Returns_Empty()
    {
        await using var factory = CreateFactory();
        var client = factory.CreateClient();

        var response = await client.GetFromJsonAsync<ArtistSuggestionsResponse>("/api/artists/suggestions?q=a");

        Assert.NotNull(response);
        Assert.Empty(response!.Styles);
        Assert.Empty(response.Communes);
    }

    [Fact]
    public async Task Suggestions_By_StyleName_Returns_Slugs()
    {
        await using var factory = CreateFactory();
        var client = factory.CreateClient();

        var response = await client.GetFromJsonAsync<ArtistSuggestionsResponse>("/api/artists/suggestions?q=black");

        Assert.NotNull(response);
        Assert.Contains("blackwork", response!.Styles);
    }

    [Fact]
    public async Task Suggestions_By_Commune_Returns_Matches()
    {
        await using var factory = CreateFactory();
        var client = factory.CreateClient();

        var response = await client.GetFromJsonAsync<ArtistSuggestionsResponse>("/api/artists/suggestions?q=Pro");

        Assert.NotNull(response);
        Assert.Contains("Providencia", response!.Communes);
    }

    private WebApplicationFactory<Program> CreateFactory() =>
        new WebApplicationFactory<Program>()
            .WithWebHostBuilder(builder => builder.UseSetting(
                "ConnectionStrings:DefaultConnection", _postgres.GetConnectionString()));

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

    private async Task SeedArtistsAsync(InkLinkDbContext context)
    {
        var now = DateTime.UtcNow;

        var blackwork = new TattooStyle { Id = Guid.NewGuid(), Name = "Blackwork", Slug = "blackwork" };
        var realismo = new TattooStyle { Id = Guid.NewGuid(), Name = "Realismo", Slug = "realismo" };
        var fineLine = new TattooStyle { Id = Guid.NewGuid(), Name = "Fine Line", Slug = "fine-line" };
        context.TattooStyles.AddRange(blackwork, realismo, fineLine);

        AddArtist(context, now, "Alice", "Black", "alice-black", "Santiago",
            ArtistType.Independent, 40000, 30000, 4.8m, true, true, [(blackwork, true)]);
        AddArtist(context, now, "Bruno", "Real", "bruno-real", "Providencia",
            ArtistType.Studio, 60000, 45000, 4.2m, false, true, [(realismo, true)]);
        AddArtist(context, now, "Carla", "Fine", "carla-fine", "Ñuñoa",
            ArtistType.Independent, 80000, 60000, 3.9m, true, true, [(fineLine, true)]);
        AddArtist(context, now, "Diego", "Studio", "diego-studio", "Las Condes",
            ArtistType.Studio, 90000, 70000, 4.4m, false, true, [(blackwork, true), (realismo, false)]);
        AddArtist(context, now, "Elena", "Budget", "elena-budget", "Maipú",
            ArtistType.Independent, 30000, 25000, 2.5m, false, true, [(blackwork, true)]);

        await context.SaveChangesAsync();
    }

    private static void AddArtist(
        InkLinkDbContext context,
        DateTime now,
        string firstName,
        string lastName,
        string slug,
        string commune,
        ArtistType artistType,
        int minSessionPrice,
        int hourlyRate,
        decimal rating,
        bool certified,
        bool published,
        IReadOnlyCollection<(TattooStyle Style, bool Featured)> styles)
    {
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = $"{slug}@example.cl",
            PasswordHash = "not-a-real-hash",
            Role = UserRole.Artist,
            FirstName = firstName,
            LastName = lastName,
            AvatarUrl = $"https://cdn.inklink.test/{slug}/avatar.jpg",
            IsVerified = true,
            CreatedAt = now,
            UpdatedAt = now
        };

        var profile = new ArtistProfile
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Slug = slug,
            Bio = $"Bio for {slug}",
            YearsExperience = 6,
            ArtistType = artistType,
            Latitude = -33.45m,
            Longitude = -70.66m,
            Commune = commune,
            MinSessionPrice = minSessionPrice,
            HourlyRate = hourlyRate,
            DepositPercentage = 30,
            CancellationPolicy = CancellationPolicy.Hours48,
            IsPublished = published,
            RatingAvg = rating,
            TotalReviews = 12
        };

        foreach (var (style, featured) in styles)
        {
            profile.ArtistStyles.Add(new ArtistStyle
            {
                ArtistProfileId = profile.Id,
                StyleId = style.Id
            });

            profile.PortfolioItems.Add(new PortfolioItem
            {
                Id = Guid.NewGuid(),
                ArtistProfileId = profile.Id,
                StyleId = style.Id,
                ImageUrl = $"https://cdn.inklink.test/{slug}/{style.Slug}.jpg",
                ThumbnailUrl = $"https://cdn.inklink.test/{slug}/{style.Slug}-thumb.jpg",
                IsFeatured = featured,
                SortOrder = featured ? 0 : 1,
                CreatedAt = now
            });
        }

        if (certified)
        {
            profile.Certifications.Add(new Certification
            {
                Id = Guid.NewGuid(),
                ArtistProfileId = profile.Id,
                Type = CertificationType.Sanitary,
                Name = "Health Permit",
                Issuer = "SEREMI",
                ValidUntil = DateOnly.FromDateTime(now.AddYears(1)),
                IsActive = true
            });
        }

        profile.Sponsorships.Add(new Sponsorship
        {
            Id = Guid.NewGuid(),
            ArtistProfileId = profile.Id,
            BrandName = "Ink Pro",
            BrandLogoUrl = $"https://cdn.inklink.test/{slug}/brand.png",
            RelationshipType = SponsorshipRelationType.Sponsored,
            IsActive = true
        });

        context.Users.Add(user);
        context.ArtistProfiles.Add(profile);
    }
}
