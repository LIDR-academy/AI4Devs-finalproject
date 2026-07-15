using System.Net;
using System.Net.Http.Headers;
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

/// <summary>US0008 TASK0001 — Weekly availability and 5-minute slot hold.</summary>
public class AvailabilityTests : IAsyncLifetime
{
    private const string ClientPassword = "Test1234!";

    private readonly PostgreSqlContainer _postgres = new PostgreSqlBuilder("postgis/postgis:16-3.4")
        .WithDatabase("inklink_availability_test")
        .WithUsername("inklink")
        .WithPassword("inklink_test_password")
        .Build();

    private Guid _artistProfileId;
    private Guid _clientId;

    // Next Monday relative to today so all generated slots are in the future
    private static readonly DateOnly WeekStart = NextMonday();

    private static DateOnly NextMonday()
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow.Date);
        var daysUntilMonday = ((int)DayOfWeek.Monday - (int)today.DayOfWeek + 7) % 7;
        return today.AddDays(daysUntilMonday == 0 ? 7 : daysUntilMonday);
    }

    public async Task InitializeAsync()
    {
        await _postgres.StartAsync();
        await using var context = CreateContext();
        await context.Database.MigrateAsync();
        await SeedDataAsync(context);
    }

    public Task DisposeAsync() => _postgres.DisposeAsync().AsTask();

    // ---------- GET availability ----------

    [Fact]
    public async Task Availability_Generates_Slots_From_Weekly_Grid()
    {
        await using var context = CreateContext();
        var response = await new AvailabilityService(context).GetWeekAvailabilityAsync(_artistProfileId, WeekStart);

        Assert.NotNull(response);
        Assert.Equal(WeekStart, response!.WeekStart);
        // Monday 10:00-14:00 with 120-minute slots => 2 slots; Tuesday 10:00-12:00 => 1 slot
        var mondaySlots = response.Slots.Where(s => s.Date == WeekStart).ToList();
        Assert.Equal(2, mondaySlots.Count);
        Assert.Equal("10:00", mondaySlots[0].StartTime);
        Assert.Equal("12:00", mondaySlots[0].EndTime);
        Assert.Equal("12:00", mondaySlots[1].StartTime);
        Assert.Equal("14:00", mondaySlots[1].EndTime);
        Assert.All(mondaySlots, s => Assert.True(s.IsAvailable));

        var tuesdaySlots = response.Slots.Where(s => s.Date == WeekStart.AddDays(1)).ToList();
        Assert.Single(tuesdaySlots);
    }

    [Fact]
    public async Task Availability_Excludes_Confirmed_Booking_Slot()
    {
        await using var context = CreateContext();
        await AddBookingAsync(context, WeekStart, new TimeOnly(10, 0), new TimeOnly(12, 0),
            BookingStatus.Confirmed, expiresAt: null);

        var response = await new AvailabilityService(context).GetWeekAvailabilityAsync(_artistProfileId, WeekStart);

        var slot = response!.Slots.Single(s => s.Date == WeekStart && s.StartTime == "10:00");
        Assert.False(slot.IsAvailable);
        // The rest of the day remains available
        Assert.True(response.Slots.Single(s => s.Date == WeekStart && s.StartTime == "12:00").IsAvailable);
    }

    [Fact]
    public async Task Availability_Excludes_Blocked_Date()
    {
        await using var context = CreateContext();
        var blockedDate = WeekStart.AddDays(1);
        context.BlockedDates.Add(new BlockedDate
        {
            Id = Guid.NewGuid(),
            ArtistProfileId = _artistProfileId,
            Date = blockedDate,
            Reason = "vacaciones"
        });
        await context.SaveChangesAsync();

        var response = await new AvailabilityService(context).GetWeekAvailabilityAsync(_artistProfileId, WeekStart);

        Assert.All(response!.Slots.Where(s => s.Date == blockedDate), s => Assert.False(s.IsAvailable));
    }

    [Fact]
    public async Task Availability_Active_Hold_Blocks_Slot_And_Expired_Hold_Releases_It()
    {
        await using var context = CreateContext();
        var active = await AddBookingAsync(context, WeekStart, new TimeOnly(10, 0), new TimeOnly(12, 0),
            BookingStatus.PendingPayment, expiresAt: DateTime.UtcNow.AddMinutes(5));
        var expired = await AddBookingAsync(context, WeekStart, new TimeOnly(12, 0), new TimeOnly(14, 0),
            BookingStatus.PendingPayment, expiresAt: DateTime.UtcNow.AddMinutes(-1));

        var response = await new AvailabilityService(context).GetWeekAvailabilityAsync(_artistProfileId, WeekStart);

        Assert.False(response!.Slots.Single(s => s.Date == WeekStart && s.StartTime == "10:00").IsAvailable);
        // Expired hold no longer blocks the slot (CA8)
        Assert.True(response.Slots.Single(s => s.Date == WeekStart && s.StartTime == "12:00").IsAvailable);
    }

    [Fact]
    public async Task Availability_Unknown_Artist_Returns_Null()
    {
        await using var context = CreateContext();
        var response = await new AvailabilityService(context).GetWeekAvailabilityAsync(Guid.NewGuid(), WeekStart);
        Assert.Null(response);
    }

    // ---------- POST /api/bookings/hold ----------

    [Fact]
    public async Task Hold_Without_Token_Returns_401()
    {
        await using var factory = CreateFactory();
        var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/bookings/hold", HoldRequest());

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Hold_Creates_PendingPayment_Booking_With_Ttl_And_Deposit()
    {
        await using var factory = CreateFactory();
        var client = await CreateAuthenticatedClientAsync(factory);

        var response = await client.PostAsJsonAsync("/api/bookings/hold", HoldRequest());

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var booking = await response.Content.ReadFromJsonAsync<BookingDto>();
        Assert.NotNull(booking);
        Assert.Equal("pending_payment", booking!.Status);
        Assert.Equal(_clientId, booking.ClientId);
        Assert.Equal(_artistProfileId, booking.Artist.ArtistProfileId);
        Assert.Equal(WeekStart, booking.BookingDate);
        Assert.Equal("10:00", booking.StartTime);
        Assert.Equal("12:00", booking.EndTime);
        // min_session_price=40000, deposit_percentage=30 => 12000 (CA4)
        Assert.Equal(40000, booking.EstimatedPriceMin);
        Assert.Equal(12000, booking.DepositAmount);
        // TTL 5 minutes (CA7)
        Assert.NotNull(booking.ExpiresAt);
        var ttl = booking.ExpiresAt!.Value - DateTime.UtcNow;
        Assert.InRange(ttl.TotalMinutes, 4, 5.5);
    }

    [Fact]
    public async Task Hold_On_Taken_Slot_Returns_409()
    {
        await using var factory = CreateFactory();
        var client = await CreateAuthenticatedClientAsync(factory);

        var first = await client.PostAsJsonAsync("/api/bookings/hold", HoldRequest());
        Assert.Equal(HttpStatusCode.Created, first.StatusCode);

        var second = await client.PostAsJsonAsync("/api/bookings/hold", HoldRequest());
        Assert.Equal(HttpStatusCode.Conflict, second.StatusCode);
    }

    [Fact]
    public async Task Hold_On_Slot_With_Expired_Hold_Succeeds()
    {
        await using var factory = CreateFactory();
        var client = await CreateAuthenticatedClientAsync(factory);
        await using var context = CreateContext();
        await AddBookingAsync(context, WeekStart, new TimeOnly(10, 0), new TimeOnly(12, 0),
            BookingStatus.PendingPayment, expiresAt: DateTime.UtcNow.AddMinutes(-1));

        var response = await client.PostAsJsonAsync("/api/bookings/hold", HoldRequest());

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        // Expired hold was cleaned up (CA8)
        var pendingCount = await context.Bookings.CountAsync(b =>
            b.ArtistProfileId == _artistProfileId && b.Status == BookingStatus.PendingPayment);
        Assert.Equal(1, pendingCount);
    }

    [Fact]
    public async Task Hold_Outside_Availability_Grid_Returns_422()
    {
        await using var factory = CreateFactory();
        var client = await CreateAuthenticatedClientAsync(factory);

        // 15:00-17:00 is outside Monday 10:00-14:00
        var request = HoldRequest() with { StartTime = "15:00", EndTime = "17:00" };
        var response = await client.PostAsJsonAsync("/api/bookings/hold", request);

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
    }

    [Fact]
    public async Task Hold_On_Past_Date_Returns_422()
    {
        await using var factory = CreateFactory();
        var client = await CreateAuthenticatedClientAsync(factory);

        var request = HoldRequest() with { BookingDate = WeekStart.AddDays(-14) };
        var response = await client.PostAsJsonAsync("/api/bookings/hold", request);

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
    }

    [Fact]
    public async Task Hold_Unknown_Artist_Returns_404()
    {
        await using var factory = CreateFactory();
        var client = await CreateAuthenticatedClientAsync(factory);

        var request = HoldRequest() with { ArtistProfileId = Guid.NewGuid() };
        var response = await client.PostAsJsonAsync("/api/bookings/hold", request);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    // ---------- Helpers ----------

    private BookingHoldRequest HoldRequest() => new(
        ArtistProfileId: _artistProfileId,
        BookingDate: WeekStart,
        StartTime: "10:00",
        EndTime: "12:00");

    private async Task<HttpClient> CreateAuthenticatedClientAsync(WebApplicationFactory<Program> factory)
    {
        var client = factory.CreateClient();
        var login = await client.PostAsJsonAsync("/api/auth/login",
            new LoginRequest("client@test.cl", ClientPassword));
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);
        var body = await login.Content.ReadFromJsonAsync<LoginResponse>();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", body!.Token);
        return client;
    }

    private async Task<Booking> AddBookingAsync(
        InkLinkDbContext context, DateOnly date, TimeOnly start, TimeOnly end,
        BookingStatus status, DateTime? expiresAt)
    {
        var booking = new Booking
        {
            Id = Guid.NewGuid(),
            ClientId = _clientId,
            ArtistProfileId = _artistProfileId,
            BookingDate = date,
            StartTime = start,
            EndTime = end,
            Status = status,
            EstimatedPriceMin = 40000,
            EstimatedPriceMax = 60000,
            DepositAmount = 12000,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = expiresAt
        };
        context.Bookings.Add(booking);
        await context.SaveChangesAsync();
        return booking;
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
        var clientUser = new User
        {
            Id = Guid.NewGuid(),
            Email = "client@test.cl",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(ClientPassword),
            Role = UserRole.Client,
            FirstName = "Carla",
            LastName = "Cliente",
            IsVerified = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _clientId = clientUser.Id;

        var artistUser = new User
        {
            Id = Guid.NewGuid(),
            Email = "artist@test.cl",
            PasswordHash = "not-a-real-hash",
            Role = UserRole.Artist,
            FirstName = "Alice",
            LastName = "Black",
            IsVerified = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

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

        // Monday 10:00-14:00 (two 120-minute slots) and Tuesday 10:00-12:00 (one slot)
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
        profile.Availabilities.Add(new Availability
        {
            Id = Guid.NewGuid(),
            ArtistProfileId = profile.Id,
            DayOfWeek = 1,
            StartTime = new TimeOnly(10, 0),
            EndTime = new TimeOnly(12, 0),
            SlotDurationMinutes = 120,
            IsActive = true
        });

        context.Users.AddRange(clientUser, artistUser);
        context.ArtistProfiles.Add(profile);
        await context.SaveChangesAsync();
    }
}
