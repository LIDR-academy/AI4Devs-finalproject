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

/// <summary>US0010 TASK0001 — Booking history, attendance confirmation and cancellation.</summary>
public class BookingHistoryTests : IAsyncLifetime
{
    private const string ClientPassword = "Test1234!";
    private const string OtherPassword = "Other1234!";

    private readonly PostgreSqlContainer _postgres = new PostgreSqlBuilder("postgis/postgis:16-3.4")
        .WithDatabase("inklink_history_test")
        .WithUsername("inklink")
        .WithPassword("inklink_test_password")
        .Build();

    private Guid _clientId;
    private Guid _artistProfileId;
    private Guid _pastConfirmedId;      // yesterday, confirmed → completable
    private Guid _futureConfirmedId;    // in 7 days, confirmed → cancellable
    private Guid _completedWithReviewId; // last week, completed + review
    private Guid _otherClientBookingId; // belongs to other user

    public async Task InitializeAsync()
    {
        await _postgres.StartAsync();
        await using var context = CreateContext();
        await context.Database.MigrateAsync();
        await SeedDataAsync(context);
    }

    public Task DisposeAsync() => _postgres.DisposeAsync().AsTask();

    // ---------- GET /api/bookings/me ----------

    [Fact]
    public async Task GetMyBookings_Returns_Only_Own_Bookings_Upcoming_First()
    {
        await using var factory = CreateFactory();
        var client = await LoginAsync(factory, "client@test.cl", ClientPassword);

        var response = await client.GetAsync("/api/bookings/me");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var body = await response.Content.ReadFromJsonAsync<BookingListResponse>();
        Assert.NotNull(body);
        Assert.Equal(3, body!.Total);
        Assert.DoesNotContain(body.Data, b => b.Id == _otherClientBookingId);

        // Upcoming first, then past descending (CA2)
        Assert.Equal(_futureConfirmedId, body.Data[0].Id);
        Assert.Equal(_pastConfirmedId, body.Data[1].Id);
        Assert.Equal(_completedWithReviewId, body.Data[2].Id);
    }

    [Fact]
    public async Task GetMyBookings_Includes_HasReview_And_Artist_Summary()
    {
        await using var factory = CreateFactory();
        var client = await LoginAsync(factory, "client@test.cl", ClientPassword);

        var body = await (await client.GetAsync("/api/bookings/me"))
            .Content.ReadFromJsonAsync<BookingListResponse>();

        var reviewed = body!.Data.Single(b => b.Id == _completedWithReviewId);
        Assert.True(reviewed.HasReview);
        Assert.Equal("Alice Black", reviewed.Artist.ArtistName);
        Assert.Equal("alice-black", reviewed.Artist.Slug);

        var pending = body.Data.Single(b => b.Id == _pastConfirmedId);
        Assert.False(pending.HasReview);
    }

    [Fact]
    public async Task GetMyBookings_Filters_By_Status_And_Paginates()
    {
        await using var factory = CreateFactory();
        var client = await LoginAsync(factory, "client@test.cl", ClientPassword);

        var confirmed = await (await client.GetAsync("/api/bookings/me?status=confirmed"))
            .Content.ReadFromJsonAsync<BookingListResponse>();
        Assert.Equal(2, confirmed!.Total);
        Assert.All(confirmed.Data, b => Assert.Equal("confirmed", b.Status));

        var page = await (await client.GetAsync("/api/bookings/me?page=2&pageSize=2"))
            .Content.ReadFromJsonAsync<BookingListResponse>();
        Assert.Equal(3, page!.Total);
        Assert.Single(page.Data);
        Assert.Equal(2, page.Page);
    }

    [Fact]
    public async Task GetMyBookings_Excludes_Expired_Holds_But_Shows_Live_Ones()
    {
        await using var factory = CreateFactory();
        var client = await LoginAsync(factory, "client@test.cl", ClientPassword);

        Guid expiredHoldId;
        Guid liveHoldId;
        await using (var context = CreateContext())
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow.Date);
            var expired = MakeBooking(_clientId, _artistProfileId, today.AddDays(10), BookingStatus.PendingPayment);
            expired.ExpiresAt = DateTime.UtcNow.AddMinutes(-1);
            var live = MakeBooking(_clientId, _artistProfileId, today.AddDays(11), BookingStatus.PendingPayment);
            live.ExpiresAt = DateTime.UtcNow.AddMinutes(4);
            context.Bookings.AddRange(expired, live);
            await context.SaveChangesAsync();
            expiredHoldId = expired.Id;
            liveHoldId = live.Id;
        }

        var body = await (await client.GetAsync("/api/bookings/me"))
            .Content.ReadFromJsonAsync<BookingListResponse>();

        Assert.DoesNotContain(body!.Data, b => b.Id == expiredHoldId);
        Assert.Contains(body.Data, b => b.Id == liveHoldId);
    }

    [Fact]
    public async Task GetMyBookings_Without_Token_Returns_401()
    {
        await using var factory = CreateFactory();
        var response = await factory.CreateClient().GetAsync("/api/bookings/me");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    // ---------- POST /api/bookings/{id}/complete ----------

    [Fact]
    public async Task Complete_Past_Confirmed_Booking_Succeeds()
    {
        await using var factory = CreateFactory();
        var client = await LoginAsync(factory, "client@test.cl", ClientPassword);

        var response = await client.PostAsync($"/api/bookings/{_pastConfirmedId}/complete", null);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var dto = await response.Content.ReadFromJsonAsync<BookingDto>();
        Assert.Equal("completed", dto!.Status);
        Assert.False(dto.HasReview);
    }

    [Fact]
    public async Task Complete_Future_Booking_Returns_409()
    {
        await using var factory = CreateFactory();
        var client = await LoginAsync(factory, "client@test.cl", ClientPassword);

        var response = await client.PostAsync($"/api/bookings/{_futureConfirmedId}/complete", null);
        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task Complete_Already_Completed_Returns_409()
    {
        await using var factory = CreateFactory();
        var client = await LoginAsync(factory, "client@test.cl", ClientPassword);

        var response = await client.PostAsync($"/api/bookings/{_completedWithReviewId}/complete", null);
        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task Complete_Foreign_Booking_Returns_403()
    {
        await using var factory = CreateFactory();
        var intruder = await LoginAsync(factory, "other@test.cl", OtherPassword);

        var response = await intruder.PostAsync($"/api/bookings/{_pastConfirmedId}/complete", null);
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    // ---------- POST /api/bookings/{id}/cancel ----------

    [Fact]
    public async Task Cancel_Future_Confirmed_Booking_Releases_The_Slot()
    {
        await using var factory = CreateFactory();
        var client = await LoginAsync(factory, "client@test.cl", ClientPassword);

        var response = await client.PostAsync($"/api/bookings/{_futureConfirmedId}/cancel", null);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var dto = await response.Content.ReadFromJsonAsync<BookingDto>();
        Assert.Equal("cancelled", dto!.Status);

        await using var context = CreateContext();
        var cancelled = await context.Bookings.SingleAsync(b => b.Id == _futureConfirmedId);
        Assert.NotNull(cancelled.CancelledAt);

        // CA11: the slot is available again
        var week = await client.GetAsync(
            $"/api/artists/{_artistProfileId}/availability?week={cancelled.BookingDate:yyyy-MM-dd}");
        var availability = await week.Content.ReadFromJsonAsync<WeekAvailabilityResponse>();
        var slot = availability!.Slots.Single(s =>
            s.Date == cancelled.BookingDate && s.StartTime == "10:00");
        Assert.True(slot.IsAvailable);
    }

    [Fact]
    public async Task Cancel_Past_Booking_Returns_409()
    {
        await using var factory = CreateFactory();
        var client = await LoginAsync(factory, "client@test.cl", ClientPassword);

        var response = await client.PostAsync($"/api/bookings/{_pastConfirmedId}/cancel", null);
        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task Cancel_Foreign_Booking_Returns_403()
    {
        await using var factory = CreateFactory();
        var intruder = await LoginAsync(factory, "other@test.cl", OtherPassword);

        var response = await intruder.PostAsync($"/api/bookings/{_futureConfirmedId}/cancel", null);
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
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
        profile.Availabilities.Add(new Availability
        {
            Id = Guid.NewGuid(),
            ArtistProfileId = profile.Id,
            DayOfWeek = 0,
            StartTime = new TimeOnly(10, 0),
            EndTime = new TimeOnly(14, 0),
            SlotDurationMinutes = 120,
            IsActive = true
        });

        var today = DateOnly.FromDateTime(DateTime.UtcNow.Date);
        // Future confirmed on a Monday so the cancel test can assert slot availability
        var futureMonday = today.AddDays(((int)DayOfWeek.Monday - (int)today.DayOfWeek + 7) % 7 is 0 ? 7 : ((int)DayOfWeek.Monday - (int)today.DayOfWeek + 7) % 7).AddDays(7);

        var pastConfirmed = MakeBooking(clientUser.Id, profile.Id, today.AddDays(-1), BookingStatus.Confirmed);
        var futureConfirmed = MakeBooking(clientUser.Id, profile.Id, futureMonday, BookingStatus.Confirmed);
        var completedWithReview = MakeBooking(clientUser.Id, profile.Id, today.AddDays(-7), BookingStatus.Completed);
        var otherBooking = MakeBooking(otherUser.Id, profile.Id, today.AddDays(3), BookingStatus.Confirmed);
        _pastConfirmedId = pastConfirmed.Id;
        _futureConfirmedId = futureConfirmed.Id;
        _completedWithReviewId = completedWithReview.Id;
        _otherClientBookingId = otherBooking.Id;

        var review = new Review
        {
            Id = Guid.NewGuid(),
            BookingId = completedWithReview.Id,
            ArtistProfileId = profile.Id,
            ClientId = clientUser.Id,
            RatingHygiene = 5,
            RatingPainManagement = 4,
            RatingCustomerService = 5,
            RatingResult = 5,
            Comment = "Excelente",
            CreatedAt = DateTime.UtcNow
        };

        context.Users.AddRange(clientUser, otherUser, artistUser);
        context.ArtistProfiles.Add(profile);
        context.Bookings.AddRange(pastConfirmed, futureConfirmed, completedWithReview, otherBooking);
        context.Reviews.Add(review);
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
