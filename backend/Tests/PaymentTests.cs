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

/// <summary>US0009 TASK0001 — Flow deposit payment: create order, webhook, idempotency, fees.</summary>
public class PaymentTests : IAsyncLifetime
{
    private const string ClientPassword = "Test1234!";
    private const string OtherPassword = "Other1234!";

    private readonly PostgreSqlContainer _postgres = new PostgreSqlBuilder("postgis/postgis:16-3.4")
        .WithDatabase("inklink_payment_test")
        .WithUsername("inklink")
        .WithPassword("inklink_test_password")
        .Build();

    private Guid _artistProfileId;
    private Guid _clientId;

    private static readonly DateOnly BookingDate = NextMonday();

    private static DateOnly NextMonday()
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow.Date);
        var days = ((int)DayOfWeek.Monday - (int)today.DayOfWeek + 7) % 7;
        return today.AddDays(days == 0 ? 7 : days);
    }

    public async Task InitializeAsync()
    {
        await _postgres.StartAsync();
        await using var context = CreateContext();
        await context.Database.MigrateAsync();
        await SeedDataAsync(context);
    }

    public Task DisposeAsync() => _postgres.DisposeAsync().AsTask();

    [Fact]
    public async Task Create_Returns_PaymentUrl_And_Registers_Fees()
    {
        await using var factory = CreateFactory();
        var client = await LoginAsync(factory, "client@test.cl", ClientPassword);
        var booking = await HoldSlotAsync(client);

        var response = await client.PostAsJsonAsync("/api/payments/create",
            new PaymentCreateRequest(booking.Id));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<PaymentCreateResponse>();
        Assert.NotNull(body);
        Assert.Contains("pago-simulado", body!.PaymentUrl);
        Assert.False(string.IsNullOrWhiteSpace(body.Token));

        await using var context = CreateContext();
        var payment = await context.Payments.SingleAsync(p => p.BookingId == booking.Id);
        // deposit 12000, commission 7% => fee 840, artist 11160 (CA7-CA8)
        Assert.Equal(12000, payment.Amount);
        Assert.Equal(840, payment.PlatformFee);
        Assert.Equal(11160, payment.ArtistAmount);
        Assert.Equal(PaymentStatus.Pending, payment.Status);
        Assert.Equal(body.Token, payment.FlowTransactionId);
    }

    [Fact]
    public async Task Create_Without_Token_Returns_401()
    {
        await using var factory = CreateFactory();
        var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/payments/create",
            new PaymentCreateRequest(Guid.NewGuid()));

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Create_For_Foreign_Booking_Returns_403()
    {
        await using var factory = CreateFactory();
        var owner = await LoginAsync(factory, "client@test.cl", ClientPassword);
        var booking = await HoldSlotAsync(owner);

        var intruder = await LoginAsync(factory, "other@test.cl", OtherPassword);
        var response = await intruder.PostAsJsonAsync("/api/payments/create",
            new PaymentCreateRequest(booking.Id));

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Create_For_Unknown_Booking_Returns_404()
    {
        await using var factory = CreateFactory();
        var client = await LoginAsync(factory, "client@test.cl", ClientPassword);

        var response = await client.PostAsJsonAsync("/api/payments/create",
            new PaymentCreateRequest(Guid.NewGuid()));

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Create_For_Expired_Hold_Returns_409()
    {
        await using var factory = CreateFactory();
        var client = await LoginAsync(factory, "client@test.cl", ClientPassword);
        var booking = await HoldSlotAsync(client);

        await using (var context = CreateContext())
        {
            await context.Bookings
                .Where(b => b.Id == booking.Id)
                .ExecuteUpdateAsync(s => s.SetProperty(b => b.ExpiresAt, DateTime.UtcNow.AddMinutes(-1)));
        }

        var response = await client.PostAsJsonAsync("/api/payments/create",
            new PaymentCreateRequest(booking.Id));

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task Successful_Payment_Confirms_Booking()
    {
        await using var factory = CreateFactory();
        var client = await LoginAsync(factory, "client@test.cl", ClientPassword);
        var booking = await HoldSlotAsync(client);
        var token = await CreatePaymentAsync(client, booking.Id);

        var outcome = await client.PostAsJsonAsync("/api/payments/mock-outcome",
            new { token, paid = true });
        Assert.Equal(HttpStatusCode.OK, outcome.StatusCode);
        var body = await outcome.Content.ReadFromJsonAsync<MockOutcomeResponse>();
        Assert.Contains($"/reservas/{booking.Id}?status=success", body!.ReturnUrl);

        await using var context = CreateContext();
        var payment = await context.Payments.SingleAsync(p => p.BookingId == booking.Id);
        var updated = await context.Bookings.SingleAsync(b => b.Id == booking.Id);
        Assert.Equal(PaymentStatus.Completed, payment.Status);
        Assert.NotNull(payment.PaidAt);
        Assert.Equal(BookingStatus.Confirmed, updated.Status);
        Assert.Null(updated.ExpiresAt);
    }

    [Fact]
    public async Task Webhook_Is_Idempotent()
    {
        await using var factory = CreateFactory();
        var client = await LoginAsync(factory, "client@test.cl", ClientPassword);
        var booking = await HoldSlotAsync(client);
        var token = await CreatePaymentAsync(client, booking.Id);
        await client.PostAsJsonAsync("/api/payments/mock-outcome", new { token, paid = true });

        DateTime? firstPaidAt;
        await using (var context = CreateContext())
        {
            firstPaidAt = (await context.Payments.SingleAsync(p => p.BookingId == booking.Id)).PaidAt;
        }

        // Duplicated webhook (form-urlencoded, as Flow sends it)
        var duplicate = await client.PostAsync("/api/payments/confirm",
            new FormUrlEncodedContent(new Dictionary<string, string> { ["token"] = token }));
        Assert.Equal(HttpStatusCode.OK, duplicate.StatusCode);

        await using var verify = CreateContext();
        var payments = await verify.Payments.Where(p => p.BookingId == booking.Id).ToListAsync();
        Assert.Single(payments);
        Assert.Equal(firstPaidAt, payments[0].PaidAt);
        Assert.Equal(PaymentStatus.Completed, payments[0].Status);
    }

    [Fact]
    public async Task Rejected_Payment_Keeps_Hold_And_Allows_Retry()
    {
        await using var factory = CreateFactory();
        var client = await LoginAsync(factory, "client@test.cl", ClientPassword);
        var booking = await HoldSlotAsync(client);
        var token = await CreatePaymentAsync(client, booking.Id);

        var outcome = await client.PostAsJsonAsync("/api/payments/mock-outcome",
            new { token, paid = false });
        var body = await outcome.Content.ReadFromJsonAsync<MockOutcomeResponse>();
        Assert.Contains($"/reservas/{booking.Id}?status=failed", body!.ReturnUrl);

        await using (var context = CreateContext())
        {
            var payment = await context.Payments.SingleAsync(p => p.BookingId == booking.Id);
            var current = await context.Bookings.SingleAsync(b => b.Id == booking.Id);
            Assert.Equal(PaymentStatus.Pending, payment.Status);
            Assert.Equal(BookingStatus.PendingPayment, current.Status);
        }

        // Retry (CA5): reuses the payment row with a fresh Flow order
        var retryToken = await CreatePaymentAsync(client, booking.Id);
        Assert.NotEqual(token, retryToken);

        await using var verify = CreateContext();
        Assert.Equal(1, await verify.Payments.CountAsync(p => p.BookingId == booking.Id));
    }

    [Fact]
    public async Task GetBooking_Returns_Confirmed_Booking_For_Owner_Only()
    {
        await using var factory = CreateFactory();
        var client = await LoginAsync(factory, "client@test.cl", ClientPassword);
        var booking = await HoldSlotAsync(client);
        var token = await CreatePaymentAsync(client, booking.Id);
        await client.PostAsJsonAsync("/api/payments/mock-outcome", new { token, paid = true });

        var response = await client.GetAsync($"/api/bookings/{booking.Id}");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var dto = await response.Content.ReadFromJsonAsync<BookingDto>();
        Assert.Equal("confirmed", dto!.Status);
        Assert.Equal(12000, dto.DepositAmount);

        var intruder = await LoginAsync(factory, "other@test.cl", OtherPassword);
        var foreign = await intruder.GetAsync($"/api/bookings/{booking.Id}");
        Assert.Equal(HttpStatusCode.NotFound, foreign.StatusCode);
    }

    // ---------- Helpers ----------

    private sealed record MockOutcomeResponse(string ReturnUrl);

    private async Task<BookingDto> HoldSlotAsync(HttpClient client)
    {
        var response = await client.PostAsJsonAsync("/api/bookings/hold", new BookingHoldRequest(
            ArtistProfileId: _artistProfileId,
            BookingDate: BookingDate,
            StartTime: "10:00",
            EndTime: "12:00"));
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        return (await response.Content.ReadFromJsonAsync<BookingDto>())!;
    }

    private static async Task<string> CreatePaymentAsync(HttpClient client, Guid bookingId)
    {
        var response = await client.PostAsJsonAsync("/api/payments/create",
            new PaymentCreateRequest(bookingId));
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<PaymentCreateResponse>();
        return body!.Token;
    }

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

        var otherUser = new User
        {
            Id = Guid.NewGuid(),
            Email = "other@test.cl",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(OtherPassword),
            Role = UserRole.Client,
            FirstName = "Otto",
            LastName = "Otro",
            IsVerified = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

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

        context.Users.AddRange(clientUser, otherUser, artistUser);
        context.ArtistProfiles.Add(profile);
        await context.SaveChangesAsync();
    }
}
