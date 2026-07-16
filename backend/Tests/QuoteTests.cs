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

/// <summary>US0011 TASK0001 — POST /api/quotes/calculate (deterministic chatbot estimation).</summary>
public class QuoteTests : IAsyncLifetime
{
    private readonly PostgreSqlContainer _postgres = new PostgreSqlBuilder("postgis/postgis:16-3.4")
        .WithDatabase("inklink_quotes_test")
        .WithUsername("inklink")
        .WithPassword("inklink_test_password")
        .Build();

    // Seeded artist tariffs: min_session_price 80.000, hourly_rate 60.000, deposit 30%
    private Guid _artistProfileId;
    private Guid _unpublishedArtistId;
    private Guid _styleId;

    public async Task InitializeAsync()
    {
        await _postgres.StartAsync();
        await using var context = CreateContext();
        await context.Database.MigrateAsync();
        await SeedDataAsync(context);
    }

    public Task DisposeAsync() => _postgres.DisposeAsync().AsTask();

    private QuoteRequest Request(string size = "coin", string bodyZone = "brazo",
        bool isColor = false, bool isCoverup = false, Guid? artistId = null, Guid? styleId = null) =>
        new(artistId ?? _artistProfileId, bodyZone, size, styleId ?? _styleId, isColor, isCoverup);

    private async Task<QuoteResponse> CalculateAsync(QuoteRequest request)
    {
        await using var factory = CreateFactory();
        var client = factory.CreateClient();
        var response = await client.PostAsJsonAsync("/api/quotes/calculate", request);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        return (await response.Content.ReadFromJsonAsync<QuoteResponse>())!;
    }

    [Fact]
    public async Task Quote_Coin_Size_Uses_MinSessionPrice_As_Base()
    {
        // coin = 1h → hourly 60.000 < min 80.000 → base 80.000; range [0.8, 1.3]
        var quote = await CalculateAsync(Request(size: "coin"));

        Assert.Equal(64_000, quote.PriceMin);
        Assert.Equal(104_000, quote.PriceMax);
        Assert.Equal("CLP", quote.Currency);
        Assert.Empty(quote.Factors);
    }

    [Fact]
    public async Task Quote_Hand_Size_Uses_HourlyRate_Times_Hours()
    {
        // hand = 4h → 240.000 > min → base 240.000
        var quote = await CalculateAsync(Request(size: "hand"));

        Assert.Equal(192_000, quote.PriceMin);
        Assert.Equal(312_000, quote.PriceMax);
    }

    [Fact]
    public async Task Quote_Coverup_Applies_30_Percent()
    {
        var quote = await CalculateAsync(Request(size: "hand", isCoverup: true));

        // base 240.000 × 1.3 = 312.000
        Assert.Equal(249_600, quote.PriceMin);
        Assert.Equal(405_600, quote.PriceMax);
        Assert.Contains(quote.Factors, f => f.Contains("Cover-up"));
    }

    [Fact]
    public async Task Quote_Color_Applies_20_Percent()
    {
        var quote = await CalculateAsync(Request(size: "hand", isColor: true));

        // base 240.000 × 1.2 = 288.000
        Assert.Equal(230_400, quote.PriceMin);
        Assert.Equal(374_400, quote.PriceMax);
        Assert.Contains(quote.Factors, f => f.Contains("Color"));
    }

    [Fact]
    public async Task Quote_Factors_Accumulate_Multiplicatively()
    {
        var quote = await CalculateAsync(Request(size: "hand", isColor: true, isCoverup: true));

        // base 240.000 × 1.3 × 1.2 = 374.400
        Assert.Equal(299_520, quote.PriceMin);
        Assert.Equal(486_720, quote.PriceMax);
        Assert.Equal(2, quote.Factors.Count);
    }

    [Fact]
    public async Task Quote_Difficult_Zone_Applies_15_Percent()
    {
        var quote = await CalculateAsync(Request(size: "hand", bodyZone: "costillas"));

        // base 240.000 × 1.15 = 276.000
        Assert.Equal(220_800, quote.PriceMin);
        Assert.Equal(358_800, quote.PriceMax);
        Assert.Contains(quote.Factors, f => f.Contains("Zona"));
    }

    [Fact]
    public async Task Quote_Deposit_Uses_MinSessionPrice_As_Floor()
    {
        // coin: priceMin 64.000 < min_session_price 80.000 → deposit = 80.000 × 30% (issue-007)
        var quote = await CalculateAsync(Request(size: "coin"));
        Assert.Equal(24_000, quote.DepositAmount);

        // hand: priceMin 192.000 > floor → deposit = 192.000 × 30%
        var big = await CalculateAsync(Request(size: "hand"));
        Assert.Equal(57_600, big.DepositAmount);
    }

    [Fact]
    public async Task Quote_Unpublished_Artist_Returns_404()
    {
        await using var factory = CreateFactory();
        var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/quotes/calculate",
            Request(artistId: _unpublishedArtistId));
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Quote_Unknown_Style_Returns_404()
    {
        await using var factory = CreateFactory();
        var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/quotes/calculate",
            Request(styleId: Guid.NewGuid()));
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Quote_Invalid_Size_Returns_422()
    {
        await using var factory = CreateFactory();
        var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/quotes/calculate",
            Request(size: "gigante"));
        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
    }

    [Fact]
    public async Task Styles_Catalog_Returns_Id_Name_And_Slug()
    {
        await using var factory = CreateFactory();
        var client = factory.CreateClient();

        var styles = await client.GetFromJsonAsync<List<TattooStyleDto>>("/api/styles");

        Assert.NotNull(styles);
        var style = Assert.Single(styles!);
        Assert.Equal(_styleId, style.Id);
        Assert.Equal("Blackwork", style.Name);
        Assert.Equal("blackwork", style.Slug);
    }

    // ---------- infrastructure ----------

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

    private async Task SeedDataAsync(InkLinkDbContext context)
    {
        var style = new TattooStyle { Id = Guid.NewGuid(), Name = "Blackwork", Slug = "blackwork" };
        context.TattooStyles.Add(style);
        _styleId = style.Id;

        var artistUser = NewUser("artist-quotes@test.cl", "Alicia", "Artista");
        var artistProfile = NewProfile(artistUser, "alicia-quotes", isPublished: true);
        context.Users.Add(artistUser);
        context.ArtistProfiles.Add(artistProfile);
        _artistProfileId = artistProfile.Id;

        var hiddenUser = NewUser("hidden-quotes@test.cl", "Oculto", "Artista");
        var hiddenProfile = NewProfile(hiddenUser, "oculto-quotes", isPublished: false);
        context.Users.Add(hiddenUser);
        context.ArtistProfiles.Add(hiddenProfile);
        _unpublishedArtistId = hiddenProfile.Id;

        await context.SaveChangesAsync();
    }

    private static User NewUser(string email, string first, string last) => new()
    {
        Id = Guid.NewGuid(),
        Email = email,
        PasswordHash = "not-a-real-hash",
        Role = UserRole.Artist,
        FirstName = first,
        LastName = last,
        IsVerified = true,
        CreatedAt = DateTime.UtcNow,
        UpdatedAt = DateTime.UtcNow
    };

    private static ArtistProfile NewProfile(User user, string slug, bool isPublished) => new()
    {
        Id = Guid.NewGuid(),
        UserId = user.Id,
        Slug = slug,
        Bio = "Test artist",
        YearsExperience = 5,
        ArtistType = ArtistType.Independent,
        Latitude = -33.44m,
        Longitude = -70.65m,
        Commune = "Santiago",
        MinSessionPrice = 80_000,
        HourlyRate = 60_000,
        DepositPercentage = 30,
        CancellationPolicy = CancellationPolicy.Hours48,
        IsPublished = isPublished
    };
}
