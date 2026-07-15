using System.Net;
using System.Net.Http.Headers;
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

/// <summary>US0013 TASK0001 — Review creation, validations and artist rating recalculation.</summary>
public class ReviewCreationTests : IAsyncLifetime
{
    private const string ClientPassword = "Test1234!";
    private const string OtherPassword = "Other1234!";

    private readonly PostgreSqlContainer _postgres = new PostgreSqlBuilder("postgis/postgis:16-3.4")
        .WithDatabase("inklink_review_test")
        .WithUsername("inklink")
        .WithPassword("inklink_test_password")
        .Build();

    private Guid _artistProfileId;
    private Guid _clientId;
    private Guid _completedBookingId;
    private Guid _confirmedBookingId;
    private Guid _secondCompletedBookingId;

    public async Task InitializeAsync()
    {
        await _postgres.StartAsync();
        await using var context = CreateContext();
        await context.Database.MigrateAsync();
        await SeedDataAsync(context);
    }

    public Task DisposeAsync() => _postgres.DisposeAsync().AsTask();

    private static ReviewRequest ValidRequest() => new(
        RatingHygiene: 5, RatingPainManagement: 4, RatingCustomerService: 5, RatingResult: 4,
        Comment: "Excelente experiencia");

    [Fact]
    public async Task Create_Review_Returns_201_And_Recalculates_Artist_Rating()
    {
        await using var factory = CreateFactory();
        var client = await LoginAsync(factory, "client@test.cl", ClientPassword);

        var response = await client.PostAsJsonAsync(
            $"/api/bookings/{_completedBookingId}/review", ValidRequest());

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var review = await response.Content.ReadFromJsonAsync<ReviewDto>();
        Assert.NotNull(review);
        // CA3: average of the 4 dimensions → (5+4+5+4)/4 = 4.5
        Assert.Equal(4.5m, review!.AverageRating);
        Assert.Equal("Carla Cliente", review.ClientName);

        await using var context = CreateContext();
        var artist = await context.ArtistProfiles.SingleAsync(a => a.Id == _artistProfileId);
        Assert.Equal(4.5m, artist.RatingAvg);
        Assert.Equal(1, artist.TotalReviews);
    }

    [Fact]
    public async Task Rating_Is_Averaged_Across_All_Reviews()
    {
        await using var factory = CreateFactory();
        var client = await LoginAsync(factory, "client@test.cl", ClientPassword);

        await client.PostAsJsonAsync($"/api/bookings/{_completedBookingId}/review", ValidRequest());
        // Second review all 2s → avg 2.0; artist avg = (4.5 + 2.0) / 2 = 3.25
        await client.PostAsJsonAsync($"/api/bookings/{_secondCompletedBookingId}/review",
            new ReviewRequest(2, 2, 2, 2));

        await using var context = CreateContext();
        var artist = await context.ArtistProfiles.SingleAsync(a => a.Id == _artistProfileId);
        Assert.Equal(3.25m, artist.RatingAvg);
        Assert.Equal(2, artist.TotalReviews);
    }

    [Fact]
    public async Task Duplicate_Review_Returns_409()
    {
        await using var factory = CreateFactory();
        var client = await LoginAsync(factory, "client@test.cl", ClientPassword);

        var first = await client.PostAsJsonAsync($"/api/bookings/{_completedBookingId}/review", ValidRequest());
        Assert.Equal(HttpStatusCode.Created, first.StatusCode);

        var second = await client.PostAsJsonAsync($"/api/bookings/{_completedBookingId}/review", ValidRequest());
        Assert.Equal(HttpStatusCode.Conflict, second.StatusCode);
    }

    [Fact]
    public async Task Review_On_Non_Completed_Booking_Returns_409()
    {
        await using var factory = CreateFactory();
        var client = await LoginAsync(factory, "client@test.cl", ClientPassword);

        var response = await client.PostAsJsonAsync(
            $"/api/bookings/{_confirmedBookingId}/review", ValidRequest());
        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task Review_On_Foreign_Booking_Returns_403()
    {
        await using var factory = CreateFactory();
        var intruder = await LoginAsync(factory, "other@test.cl", OtherPassword);

        var response = await intruder.PostAsJsonAsync(
            $"/api/bookings/{_completedBookingId}/review", ValidRequest());
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Rating_Out_Of_Range_Returns_422()
    {
        await using var factory = CreateFactory();
        var client = await LoginAsync(factory, "client@test.cl", ClientPassword);

        var response = await client.PostAsJsonAsync(
            $"/api/bookings/{_completedBookingId}/review",
            new ReviewRequest(6, 4, 5, 4));
        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
    }

    [Fact]
    public async Task Comment_Over_2000_Chars_Returns_422()
    {
        await using var factory = CreateFactory();
        var client = await LoginAsync(factory, "client@test.cl", ClientPassword);

        var response = await client.PostAsJsonAsync(
            $"/api/bookings/{_completedBookingId}/review",
            new ReviewRequest(5, 5, 5, 5, new string('x', 2001)));
        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
    }

    [Fact]
    public async Task New_Review_Appears_In_Artist_Public_Reviews()
    {
        await using var factory = CreateFactory();
        var client = await LoginAsync(factory, "client@test.cl", ClientPassword);
        await client.PostAsJsonAsync($"/api/bookings/{_completedBookingId}/review", ValidRequest());

        // CA7: visible in the artist profile reviews (US0006 endpoint)
        var response = await factory.CreateClient().GetAsync("/api/artists/alice-black/reviews?page=1&pageSize=5");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var list = await response.Content.ReadFromJsonAsync<ReviewListResponse>();
        Assert.Contains(list!.Data, r => r.Comment == "Excelente experiencia");
    }

    // ---------- Helpers ----------

    private static async Task<HttpClient> LoginAsync(
        WebApplicationFactory<Program> factory, string email, string password)
    {
        var client = factory.CreateClient();
        var login = await client.PostAsJsonAsync("/api/auth/login", new LoginRequest(email, password));
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);
        var body = await login.Content.ReadFromJsonAsync<LoginResponse>();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", body!.Token);
        return client;
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

    private async Task SeedDataAsync(InkLinkDbContext context)
    {
        var clientUser = MakeUser("client@test.cl", ClientPassword, "Carla", "Cliente");
        var otherUser = MakeUser("other@test.cl", OtherPassword, "Otto", "Otro");
        var artistUser = MakeUser("artist@test.cl", "irrelevant", "Alice", "Black");
        _clientId = clientUser.Id;

        var profile = new ArtistProfile
        {
            Id = Guid.NewGuid(),
            UserId = artistUser.Id,
            Slug = "alice-black",
            ArtistType = ArtistType.Independent,
            Latitude = -33.4372m,
            Longitude = -70.6506m,
            Commune = "Santiago",
            MinSessionPrice = 40000,
            HourlyRate = 30000,
            DepositPercentage = 30,
            CancellationPolicy = CancellationPolicy.Hours48,
            IsPublished = true
        };
        _artistProfileId = profile.Id;

        var today = DateOnly.FromDateTime(DateTime.UtcNow.Date);
        var completed = MakeBooking(clientUser.Id, profile.Id, today.AddDays(-7), BookingStatus.Completed);
        var secondCompleted = MakeBooking(clientUser.Id, profile.Id, today.AddDays(-14), BookingStatus.Completed);
        var confirmed = MakeBooking(clientUser.Id, profile.Id, today.AddDays(7), BookingStatus.Confirmed);
        _completedBookingId = completed.Id;
        _secondCompletedBookingId = secondCompleted.Id;
        _confirmedBookingId = confirmed.Id;

        context.Users.AddRange(clientUser, otherUser, artistUser);
        context.ArtistProfiles.Add(profile);
        context.Bookings.AddRange(completed, secondCompleted, confirmed);
        await context.SaveChangesAsync();
    }

    private static User MakeUser(string email, string password, string first, string last) => new()
    {
        Id = Guid.NewGuid(),
        Email = email,
        PasswordHash = password == "irrelevant" ? "not-a-real-hash" : BCrypt.Net.BCrypt.HashPassword(password),
        Role = UserRole.Client,
        FirstName = first,
        LastName = last,
        IsVerified = true,
        CreatedAt = DateTime.UtcNow,
        UpdatedAt = DateTime.UtcNow
    };

    private static Booking MakeBooking(Guid clientId, Guid artistProfileId, DateOnly date, BookingStatus status) => new()
    {
        Id = Guid.NewGuid(),
        ClientId = clientId,
        ArtistProfileId = artistProfileId,
        BookingDate = date,
        StartTime = new TimeOnly(10, 0),
        EndTime = new TimeOnly(12, 0),
        Status = status,
        EstimatedPriceMin = 40000,
        EstimatedPriceMax = 60000,
        DepositAmount = 12000,
        CreatedAt = DateTime.UtcNow
    };
}
