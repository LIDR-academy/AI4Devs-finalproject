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

public class ArtistFilterTests : IAsyncLifetime
{
    private readonly PostgreSqlContainer _postgres = new PostgreSqlBuilder("postgis/postgis:16-3.4")
        .WithDatabase("inklink_artist_filters_test")
        .WithUsername("inklink")
        .WithPassword("inklink_test_password")
        .Build();

    private readonly List<Guid> _publishedArtistIds = [];
    private Guid _unpublishedArtistId;

    public async Task InitializeAsync()
    {
        await _postgres.StartAsync();
        await using var context = CreateContext();
        await context.Database.MigrateAsync();
        await SeedArtistsAsync(context);
    }

    public Task DisposeAsync() => _postgres.DisposeAsync().AsTask();

    [Fact]
    public async Task NoFilters_Returns_All_Published_Artists_Paginated()
    {
        await using var factory = CreateFactory();
        var client = factory.CreateClient();

        var response = await client.GetAsync("/api/artists");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var payload = await response.Content.ReadFromJsonAsync<ArtistListResponse>();
        Assert.NotNull(payload);
        Assert.Equal(5, payload!.Total);
        Assert.Equal(1, payload.Page);
        Assert.Equal(12, payload.PageSize);
        Assert.Equal(5, payload.Data.Count);
        Assert.DoesNotContain(payload.Data, artist => artist.Id == _unpublishedArtistId);
    }

    [Fact]
    public async Task StyleFilter_Returns_Only_Artists_With_That_Style()
    {
        await using var factory = CreateFactory();
        var client = factory.CreateClient();

        var payload = await client.GetFromJsonAsync<ArtistListResponse>("/api/artists?styles=blackwork");

        Assert.NotNull(payload);
        Assert.Equal(3, payload!.Total);
        Assert.Equal(
            ["alice-black", "diego-studio", "elena-budget"],
            payload.Data.Select(a => a.Slug).ToArray());
    }

    [Fact]
    public async Task MultipleStyleFilters_Returns_Artists_With_Any_Of_The_Styles()
    {
        await using var factory = CreateFactory();
        var client = factory.CreateClient();

        var payload = await client.GetFromJsonAsync<ArtistListResponse>("/api/artists?styles=fine-line&styles=realismo");

        Assert.NotNull(payload);
        Assert.Equal(3, payload!.Total);
        Assert.Equal(
            ["bruno-real", "carla-fine", "diego-studio"],
            payload.Data.Select(a => a.Slug).ToArray());
    }

    [Fact]
    public async Task PriceFilter_Returns_Artists_Within_Range()
    {
        await using var factory = CreateFactory();
        var client = factory.CreateClient();

        var payload = await client.GetFromJsonAsync<ArtistListResponse>("/api/artists?minPrice=35000&maxPrice=70000");

        Assert.NotNull(payload);
        Assert.Equal(
            ["alice-black", "bruno-real"],
            payload!.Data.Select(a => a.Slug).ToArray());
    }

    [Fact]
    public async Task MinRating_Filter_Returns_Only_Qualifying_Artists()
    {
        await using var factory = CreateFactory();
        var client = factory.CreateClient();

        var payload = await client.GetFromJsonAsync<ArtistListResponse>("/api/artists?minRating=4.0");

        Assert.NotNull(payload);
        Assert.Equal(
            ["alice-black", "bruno-real", "diego-studio"],
            payload!.Data.Select(a => a.Slug).ToArray());
    }

    [Fact]
    public async Task CertifiedFilter_Returns_Only_Certified_Artists()
    {
        await using var factory = CreateFactory();
        var client = factory.CreateClient();

        var payload = await client.GetFromJsonAsync<ArtistListResponse>("/api/artists?certified=true");

        Assert.NotNull(payload);
        Assert.Equal(
            ["alice-black", "carla-fine"],
            payload!.Data.Select(a => a.Slug).ToArray());
        Assert.All(payload.Data, artist => Assert.True(artist.IsCertified));
    }

    [Fact]
    public async Task TypeFilter_Returns_Only_Matching_ArtistType()
    {
        await using var factory = CreateFactory();
        var client = factory.CreateClient();

        var payload = await client.GetFromJsonAsync<ArtistListResponse>("/api/artists?type=studio");

        Assert.NotNull(payload);
        Assert.Equal(
            ["bruno-real", "diego-studio"],
            payload!.Data.Select(a => a.Slug).ToArray());
        Assert.All(payload.Data, artist => Assert.Equal("studio", artist.ArtistType));
    }

    [Fact]
    public async Task CombinedFilters_Apply_AND_Logic()
    {
        await using var factory = CreateFactory();
        var client = factory.CreateClient();

        var payload = await client.GetFromJsonAsync<ArtistListResponse>(
            "/api/artists?styles=blackwork&certified=true&minRating=4.5");

        Assert.NotNull(payload);
        Assert.Single(payload!.Data);
        Assert.Equal("alice-black", payload.Data[0].Slug);
    }

    [Fact]
    public async Task PageSize_Over_50_Is_Clamped_To_50()
    {
        await using var factory = CreateFactory();
        var client = factory.CreateClient();

        var payload = await client.GetFromJsonAsync<ArtistListResponse>("/api/artists?pageSize=100");

        Assert.NotNull(payload);
        Assert.Equal(50, payload!.PageSize);
        Assert.Equal(5, payload.Data.Count);
    }

    [Fact]
    public async Task Pagination_Returns_Correct_Subset()
    {
        await using var factory = CreateFactory();
        var client = factory.CreateClient();

        var payload = await client.GetFromJsonAsync<ArtistListResponse>("/api/artists?page=2&pageSize=2");

        Assert.NotNull(payload);
        Assert.Equal(5, payload!.Total);
        Assert.Equal(2, payload.Page);
        Assert.Equal(2, payload.PageSize);
        Assert.Equal(
            ["carla-fine", "diego-studio"],
            payload.Data.Select(a => a.Slug).ToArray());
    }

    [Fact]
    public async Task UnpublishedArtists_Never_Returned()
    {
        await using var factory = CreateFactory();
        var client = factory.CreateClient();

        var payload = await client.GetFromJsonAsync<ArtistListResponse>("/api/artists?style=realismo");

        Assert.NotNull(payload);
        Assert.DoesNotContain(payload!.Data, artist => artist.Id == _unpublishedArtistId);
        Assert.DoesNotContain("frank-hidden", payload.Data.Select(a => a.Slug));
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
        var monday = GetCurrentWeekMonday();

        var blackwork = new TattooStyle { Id = Guid.NewGuid(), Name = "Blackwork", Slug = "blackwork" };
        var realismo = new TattooStyle { Id = Guid.NewGuid(), Name = "Realismo", Slug = "realismo" };
        var fineLine = new TattooStyle { Id = Guid.NewGuid(), Name = "Fine Line", Slug = "fine-line" };
        context.TattooStyles.AddRange(blackwork, realismo, fineLine);

        _publishedArtistIds.Add(AddArtist(
            context, now, "Alice", "Black", "alice-black", "Santiago",
            ArtistType.Independent, 40000, 30000, 4.8m, true, true,
            [(blackwork, true)], [0], []));
        _publishedArtistIds.Add(AddArtist(
            context, now, "Bruno", "Real", "bruno-real", "Providencia",
            ArtistType.Studio, 60000, 45000, 4.2m, false, true,
            [(realismo, true)], [1], [monday.AddDays(1)]));
        _publishedArtistIds.Add(AddArtist(
            context, now, "Carla", "Fine", "carla-fine", "Ñuñoa",
            ArtistType.Independent, 80000, 60000, 3.9m, true, true,
            [(fineLine, true)], [], []));
        _publishedArtistIds.Add(AddArtist(
            context, now, "Diego", "Studio", "diego-studio", "Las Condes",
            ArtistType.Studio, 90000, 70000, 4.4m, false, true,
            [(blackwork, true), (realismo, false)], [2], []));
        _publishedArtistIds.Add(AddArtist(
            context, now, "Elena", "Budget", "elena-budget", "Maipú",
            ArtistType.Independent, 30000, 25000, 2.5m, false, true,
            [(blackwork, true)], [6], []));

        _unpublishedArtistId = AddArtist(
            context, now, "Frank", "Hidden", "frank-hidden", "Recoleta",
            ArtistType.Studio, 70000, 50000, 4.9m, true, false,
            [(realismo, true)], [3], []);

        await context.SaveChangesAsync();
    }

    private static Guid AddArtist(
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
        IReadOnlyCollection<(TattooStyle Style, bool Featured)> styles,
        IReadOnlyCollection<int> availableDays,
        IReadOnlyCollection<DateOnly> blockedDates)
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

        foreach (var day in availableDays)
        {
            profile.Availabilities.Add(new Availability
            {
                Id = Guid.NewGuid(),
                ArtistProfileId = profile.Id,
                DayOfWeek = day,
                StartTime = new TimeOnly(10, 0),
                EndTime = new TimeOnly(18, 0),
                SlotDurationMinutes = 120,
                IsActive = true
            });
        }

        foreach (var blockedDate in blockedDates)
        {
            profile.BlockedDates.Add(new BlockedDate
            {
                Id = Guid.NewGuid(),
                ArtistProfileId = profile.Id,
                Date = blockedDate,
                Reason = "Blocked for tests"
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

        return profile.Id;
    }

    private static DateOnly GetCurrentWeekMonday()
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var offset = today.DayOfWeek == DayOfWeek.Sunday
            ? -6
            : DayOfWeek.Monday - today.DayOfWeek;
        return today.AddDays(offset);
    }
}
