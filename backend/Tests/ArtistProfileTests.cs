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

public class ArtistProfileTests : IAsyncLifetime
{
    private readonly PostgreSqlContainer _postgres = new PostgreSqlBuilder("postgis/postgis:16-3.4")
        .WithDatabase("inklink_artist_profile_test")
        .WithUsername("inklink")
        .WithPassword("inklink_test_password")
        .Build();

    private Guid _aliceProfileId;
    private Guid _brunoProfileId;
    private Guid _unpublishedProfileId;

    public async Task InitializeAsync()
    {
        await _postgres.StartAsync();
        await using var context = CreateContext();
        await context.Database.MigrateAsync();
        await SeedDataAsync(context);
    }

    public Task DisposeAsync() => _postgres.DisposeAsync().AsTask();

    [Fact]
    public async Task GetProfile_ValidSlug_Returns_CompleteProfile()
    {
        await using var factory = CreateFactory();
        var client = factory.CreateClient();

        var response = await client.GetAsync("/api/artists/alice-black");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var profile = await response.Content.ReadFromJsonAsync<ArtistProfileDto>();
        Assert.NotNull(profile);
        Assert.Equal(_aliceProfileId, profile!.Id);
        Assert.Equal("Alice Black", profile.ArtistName);
        Assert.Equal("alice-black", profile.Slug);
        Assert.Equal("independent", profile.ArtistType);
        Assert.Equal("Santiago", profile.Commune);
        Assert.Equal(40000, profile.MinSessionPrice);
        Assert.Equal(30000, profile.HourlyRate);
        Assert.Equal(30, profile.DepositPercentage);
        Assert.Equal("hours48", profile.CancellationPolicy);
        Assert.True(profile.IsCertified);
        Assert.Equal(4.8m, profile.AverageRating);
        Assert.Equal(12, profile.ReviewCount);
        Assert.Contains("blackwork", profile.Styles);
        Assert.NotEmpty(profile.PortfolioItems);
        Assert.NotEmpty(profile.Certifications);
        Assert.NotEmpty(profile.Awards);
        Assert.NotEmpty(profile.SponsorBadges);
        Assert.NotEmpty(profile.AvailableSlots);
    }

    [Fact]
    public async Task GetProfile_InvalidSlug_Returns_404()
    {
        await using var factory = CreateFactory();
        var client = factory.CreateClient();

        var response = await client.GetAsync("/api/artists/nonexistent-artist");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task GetProfile_UnpublishedArtist_Returns_404()
    {
        await using var factory = CreateFactory();
        var client = factory.CreateClient();

        var response = await client.GetAsync("/api/artists/frank-hidden");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task GetProfile_PortfolioItems_Ordered_By_SortOrder()
    {
        await using var factory = CreateFactory();
        var client = factory.CreateClient();

        var profile = await client.GetFromJsonAsync<ArtistProfileDto>("/api/artists/alice-black");
        Assert.NotNull(profile);

        var sortOrders = profile!.PortfolioItems.Select(p => p.SortOrder).ToList();
        Assert.Equal(sortOrders.OrderBy(x => x).ToList(), sortOrders);
    }

    [Fact]
    public async Task GetProfile_Awards_Ordered_By_Year_Descending()
    {
        await using var factory = CreateFactory();
        var client = factory.CreateClient();

        var profile = await client.GetFromJsonAsync<ArtistProfileDto>("/api/artists/alice-black");
        Assert.NotNull(profile);
        Assert.True(profile!.Awards.Count >= 2);

        var years = profile.Awards.Select(a => a.Year).ToList();
        Assert.Equal(years.OrderByDescending(x => x).ToList(), years);
    }

    [Fact]
    public async Task GetProfile_Only_ActiveCertifications_Returned()
    {
        await using var factory = CreateFactory();
        var client = factory.CreateClient();

        var profile = await client.GetFromJsonAsync<ArtistProfileDto>("/api/artists/bruno-real");
        Assert.NotNull(profile);
        // Bruno has one active and one inactive certification; only active returned in profile
        // Actually per the contract, we return all certifications with their IsActive flag
        // The contract DTO has IsActive field, so we return all but filter is done at service level
        // Let me check: the task says "Only_ActiveCertifications_Returned"
        // The service includes all certifications without filtering, but the test name says only active.
        // Let me re-read the task... it says in certifications DTO we have IsActive field.
        // But the test name says "Only_ActiveCertifications_Returned" - so we should filter.
        // Actually looking at the seed data for bruno, he has 1 active + 1 inactive cert.
        // The test expects only the active one is returned.
        Assert.Single(profile!.Certifications);
        Assert.True(profile.Certifications[0].IsActive);
    }

    [Fact]
    public async Task GetProfile_Only_ActiveSponsors_Returned()
    {
        await using var factory = CreateFactory();
        var client = factory.CreateClient();

        var profile = await client.GetFromJsonAsync<ArtistProfileDto>("/api/artists/bruno-real");
        Assert.NotNull(profile);
        // Bruno has 1 active + 1 inactive sponsor; only active should be returned
        Assert.Single(profile!.SponsorBadges);
        Assert.Equal("Ink Pro", profile.SponsorBadges[0].BrandName);
    }

    [Fact]
    public async Task GetReviews_ValidSlug_Returns_Paginated()
    {
        await using var factory = CreateFactory();
        var client = factory.CreateClient();

        var response = await client.GetAsync("/api/artists/alice-black/reviews?page=1&pageSize=2");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<ReviewListResponse>();
        Assert.NotNull(result);
        Assert.Equal(3, result!.Total);
        Assert.Equal(2, result.Data.Count);
        Assert.Equal(1, result.Page);
        Assert.Equal(2, result.PageSize);
    }

    [Fact]
    public async Task GetReviews_InvalidSlug_Returns_404()
    {
        await using var factory = CreateFactory();
        var client = factory.CreateClient();

        var response = await client.GetAsync("/api/artists/nonexistent/reviews");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task GetReviews_DoesNotExpose_ClientLastName_Or_Email()
    {
        await using var factory = CreateFactory();
        var client = factory.CreateClient();

        var result = await client.GetFromJsonAsync<ReviewListResponse>("/api/artists/alice-black/reviews");
        Assert.NotNull(result);
        Assert.NotEmpty(result!.Data);

        foreach (var review in result.Data)
        {
            // ClientName should only be the first name
            Assert.Equal("Maria", review.ClientName);
            Assert.DoesNotContain("Lopez", review.ClientName);
            Assert.DoesNotContain("@", review.ClientName);
        }
    }

    [Fact]
    public async Task GetReviews_AverageRating_Calculated_Correctly()
    {
        await using var factory = CreateFactory();
        var client = factory.CreateClient();

        var result = await client.GetFromJsonAsync<ReviewListResponse>("/api/artists/alice-black/reviews");
        Assert.NotNull(result);

        var firstReview = result!.Data[0];
        var expected = Math.Round(
            (firstReview.RatingHygiene + firstReview.RatingPainManagement +
             firstReview.RatingCustomerService + firstReview.RatingResult) / 4.0m, 2);
        Assert.Equal(expected, firstReview.AverageRating);
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
        var now = DateTime.UtcNow;

        var blackwork = new TattooStyle { Id = Guid.NewGuid(), Name = "Blackwork", Slug = "blackwork" };
        var realismo = new TattooStyle { Id = Guid.NewGuid(), Name = "Realismo", Slug = "realismo" };
        context.TattooStyles.AddRange(blackwork, realismo);

        // Client user for reviews
        var clientUser = new User
        {
            Id = Guid.NewGuid(),
            Email = "maria@example.cl",
            PasswordHash = "not-a-real-hash",
            Role = UserRole.Client,
            FirstName = "Maria",
            LastName = "Lopez",
            IsVerified = true,
            CreatedAt = now,
            UpdatedAt = now
        };
        context.Users.Add(clientUser);

        // Alice - published, certified, with awards and reviews
        var aliceUser = new User
        {
            Id = Guid.NewGuid(),
            Email = "alice-black@example.cl",
            PasswordHash = "not-a-real-hash",
            Role = UserRole.Artist,
            FirstName = "Alice",
            LastName = "Black",
            AvatarUrl = "https://cdn.inklink.test/alice-black/avatar.jpg",
            IsVerified = true,
            CreatedAt = now,
            UpdatedAt = now
        };
        context.Users.Add(aliceUser);

        var aliceProfile = new ArtistProfile
        {
            Id = Guid.NewGuid(),
            UserId = aliceUser.Id,
            Slug = "alice-black",
            Bio = "Bio for alice-black",
            YearsExperience = 6,
            ArtistType = ArtistType.Independent,
            Latitude = -33.45m,
            Longitude = -70.66m,
            Commune = "Santiago",
            MinSessionPrice = 40000,
            HourlyRate = 30000,
            DepositPercentage = 30,
            CancellationPolicy = CancellationPolicy.Hours48,
            IsPublished = true,
            RatingAvg = 4.8m,
            TotalReviews = 12
        };
        _aliceProfileId = aliceProfile.Id;

        // Styles
        aliceProfile.ArtistStyles.Add(new ArtistStyle { ArtistProfileId = aliceProfile.Id, StyleId = blackwork.Id });

        // Portfolio items (multiple to test ordering)
        aliceProfile.PortfolioItems.Add(new PortfolioItem
        {
            Id = Guid.NewGuid(), ArtistProfileId = aliceProfile.Id, StyleId = blackwork.Id,
            ImageUrl = "https://cdn.inklink.test/alice/img2.jpg", ThumbnailUrl = "https://cdn.inklink.test/alice/img2-thumb.jpg",
            IsFeatured = false, SortOrder = 2, CreatedAt = now
        });
        aliceProfile.PortfolioItems.Add(new PortfolioItem
        {
            Id = Guid.NewGuid(), ArtistProfileId = aliceProfile.Id, StyleId = blackwork.Id,
            ImageUrl = "https://cdn.inklink.test/alice/img0.jpg", ThumbnailUrl = "https://cdn.inklink.test/alice/img0-thumb.jpg",
            IsFeatured = true, SortOrder = 0, CreatedAt = now
        });
        aliceProfile.PortfolioItems.Add(new PortfolioItem
        {
            Id = Guid.NewGuid(), ArtistProfileId = aliceProfile.Id, StyleId = blackwork.Id,
            ImageUrl = "https://cdn.inklink.test/alice/img1.jpg", ThumbnailUrl = "https://cdn.inklink.test/alice/img1-thumb.jpg",
            IsFeatured = false, SortOrder = 1, CreatedAt = now
        });

        // Certifications (active)
        aliceProfile.Certifications.Add(new Certification
        {
            Id = Guid.NewGuid(), ArtistProfileId = aliceProfile.Id,
            Type = CertificationType.Sanitary, Name = "Health Permit", Issuer = "SEREMI",
            ValidUntil = DateOnly.FromDateTime(now.AddYears(1)), IsActive = true
        });

        // Awards (multiple years to test ordering)
        aliceProfile.Awards.Add(new Award
        {
            Id = Guid.NewGuid(), ArtistProfileId = aliceProfile.Id,
            Title = "Mejor Blackwork", EventName = "Expo Tattoo 2023", Year = 2023, Category = "Blackwork"
        });
        aliceProfile.Awards.Add(new Award
        {
            Id = Guid.NewGuid(), ArtistProfileId = aliceProfile.Id,
            Title = "Mejor Realismo", EventName = "Expo Tattoo 2025", Year = 2025, Category = "Realismo"
        });

        // Sponsorship (active)
        aliceProfile.Sponsorships.Add(new Sponsorship
        {
            Id = Guid.NewGuid(), ArtistProfileId = aliceProfile.Id,
            BrandName = "Ink Pro", BrandLogoUrl = "https://cdn.inklink.test/brand.png",
            RelationshipType = SponsorshipRelationType.Sponsored, IsActive = true
        });

        // Availabilities
        aliceProfile.Availabilities.Add(new Availability
        {
            Id = Guid.NewGuid(), ArtistProfileId = aliceProfile.Id,
            DayOfWeek = 0, StartTime = new TimeOnly(10, 0), EndTime = new TimeOnly(18, 0),
            SlotDurationMinutes = 120, IsActive = true
        });

        context.ArtistProfiles.Add(aliceProfile);

        // Bruno - published, with mixed active/inactive certs and sponsors
        var brunoUser = new User
        {
            Id = Guid.NewGuid(),
            Email = "bruno-real@example.cl",
            PasswordHash = "not-a-real-hash",
            Role = UserRole.Artist,
            FirstName = "Bruno",
            LastName = "Real",
            AvatarUrl = "https://cdn.inklink.test/bruno-real/avatar.jpg",
            IsVerified = true,
            CreatedAt = now,
            UpdatedAt = now
        };
        context.Users.Add(brunoUser);

        var brunoProfile = new ArtistProfile
        {
            Id = Guid.NewGuid(),
            UserId = brunoUser.Id,
            Slug = "bruno-real",
            Bio = "Bio for bruno-real",
            YearsExperience = 4,
            ArtistType = ArtistType.Studio,
            Latitude = -33.42m,
            Longitude = -70.60m,
            Commune = "Providencia",
            MinSessionPrice = 60000,
            HourlyRate = 45000,
            DepositPercentage = 30,
            CancellationPolicy = CancellationPolicy.Hours24,
            IsPublished = true,
            RatingAvg = 4.2m,
            TotalReviews = 5
        };
        _brunoProfileId = brunoProfile.Id;

        brunoProfile.ArtistStyles.Add(new ArtistStyle { ArtistProfileId = brunoProfile.Id, StyleId = realismo.Id });
        brunoProfile.PortfolioItems.Add(new PortfolioItem
        {
            Id = Guid.NewGuid(), ArtistProfileId = brunoProfile.Id, StyleId = realismo.Id,
            ImageUrl = "https://cdn.inklink.test/bruno/img.jpg", ThumbnailUrl = "https://cdn.inklink.test/bruno/img-thumb.jpg",
            IsFeatured = true, SortOrder = 0, CreatedAt = now
        });

        // Certifications: 1 active, 1 inactive
        brunoProfile.Certifications.Add(new Certification
        {
            Id = Guid.NewGuid(), ArtistProfileId = brunoProfile.Id,
            Type = CertificationType.Sanitary, Name = "Active Cert", Issuer = "SEREMI",
            ValidUntil = DateOnly.FromDateTime(now.AddYears(1)), IsActive = true
        });
        brunoProfile.Certifications.Add(new Certification
        {
            Id = Guid.NewGuid(), ArtistProfileId = brunoProfile.Id,
            Type = CertificationType.Municipal, Name = "Expired Cert", Issuer = "Municipality",
            ValidUntil = DateOnly.FromDateTime(now.AddYears(-1)), IsActive = false
        });

        // Sponsorships: 1 active, 1 inactive
        brunoProfile.Sponsorships.Add(new Sponsorship
        {
            Id = Guid.NewGuid(), ArtistProfileId = brunoProfile.Id,
            BrandName = "Ink Pro", BrandLogoUrl = "https://cdn.inklink.test/brand.png",
            RelationshipType = SponsorshipRelationType.Sponsored, IsActive = true
        });
        brunoProfile.Sponsorships.Add(new Sponsorship
        {
            Id = Guid.NewGuid(), ArtistProfileId = brunoProfile.Id,
            BrandName = "Old Brand", BrandLogoUrl = "https://cdn.inklink.test/old.png",
            RelationshipType = SponsorshipRelationType.Ambassador, IsActive = false
        });

        context.ArtistProfiles.Add(brunoProfile);

        // Frank - unpublished
        var frankUser = new User
        {
            Id = Guid.NewGuid(),
            Email = "frank-hidden@example.cl",
            PasswordHash = "not-a-real-hash",
            Role = UserRole.Artist,
            FirstName = "Frank",
            LastName = "Hidden",
            IsVerified = true,
            CreatedAt = now,
            UpdatedAt = now
        };
        context.Users.Add(frankUser);

        var frankProfile = new ArtistProfile
        {
            Id = Guid.NewGuid(),
            UserId = frankUser.Id,
            Slug = "frank-hidden",
            Bio = "Hidden artist",
            YearsExperience = 2,
            ArtistType = ArtistType.Studio,
            Latitude = -33.40m,
            Longitude = -70.65m,
            Commune = "Recoleta",
            MinSessionPrice = 70000,
            HourlyRate = 50000,
            DepositPercentage = 30,
            CancellationPolicy = CancellationPolicy.Hours72,
            IsPublished = false,
            RatingAvg = 4.9m,
            TotalReviews = 0
        };
        _unpublishedProfileId = frankProfile.Id;
        context.ArtistProfiles.Add(frankProfile);

        await context.SaveChangesAsync();

        // Create bookings and reviews for Alice (need separate SaveChanges due to FK constraints)
        for (int i = 0; i < 3; i++)
        {
            var booking = new Booking
            {
                Id = Guid.NewGuid(),
                ClientId = clientUser.Id,
                ArtistProfileId = aliceProfile.Id,
                BookingDate = DateOnly.FromDateTime(now.AddDays(-30 + i)),
                StartTime = new TimeOnly(10, 0),
                EndTime = new TimeOnly(12, 0),
                Status = BookingStatus.Completed,
                EstimatedPriceMin = 40000,
                EstimatedPriceMax = 60000,
                DepositAmount = 12000,
                CreatedAt = now.AddDays(-30 + i)
            };
            context.Bookings.Add(booking);

            var review = new Review
            {
                Id = Guid.NewGuid(),
                BookingId = booking.Id,
                ClientId = clientUser.Id,
                ArtistProfileId = aliceProfile.Id,
                RatingHygiene = 5,
                RatingPainManagement = 4,
                RatingCustomerService = 5,
                RatingResult = 5,
                Comment = $"Great tattoo #{i + 1}",
                CreatedAt = now.AddDays(-20 + i)
            };
            context.Reviews.Add(review);
        }

        await context.SaveChangesAsync();
    }
}
