using InkLink.Api.Infrastructure.Data;
using InkLink.Api.Seed;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Npgsql;
using Testcontainers.PostgreSql;

namespace InkLink.Api.Tests;

public class DatabaseMigrationAndSeedTests : IAsyncLifetime
{
    private readonly PostgreSqlContainer _postgres = new PostgreSqlBuilder("postgis/postgis:16-3.4")
        .WithDatabase("inklink_test")
        .WithUsername("inklink")
        .WithPassword("inklink_test_password")
        .Build();

    public Task InitializeAsync() => _postgres.StartAsync();

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

    [Fact]
    public async Task Migration_And_Seed_Produce_Complete_Coherent_Data()
    {
        await using var context = CreateContext();

        // Migration applies cleanly
        await context.Database.MigrateAsync();

        // Seed executes
        var seeder = new DatabaseSeeder(context, NullLogger<DatabaseSeeder>.Instance);
        await seeder.SeedAsync();

        // Query by email returns a user with a bcrypt-hashed password (never plain text)
        var client = await context.Users.SingleAsync(u => u.Email == "camila.rojas@example.cl");
        Assert.NotEqual("Test1234!", client.PasswordHash);
        Assert.True(BCrypt.Net.BCrypt.Verify("Test1234!", client.PasswordHash));

        // Seed data is complete: 8 clients + 14 artists + 1 admin, 14 profiles, 12 styles
        Assert.Equal(23, await context.Users.CountAsync());
        Assert.Equal(14, await context.ArtistProfiles.CountAsync());
        Assert.Equal(12, await context.TattooStyles.CountAsync());

        // Every artist profile is publishable: bio, portfolio, tariffs and availability
        var profiles = await context.ArtistProfiles
            .Include(p => p.PortfolioItems)
            .Include(p => p.Availabilities)
            .Include(p => p.ArtistStyles)
            .ToListAsync();
        Assert.All(profiles, p =>
        {
            Assert.True(p.IsPublished);
            Assert.False(string.IsNullOrWhiteSpace(p.Bio));
            Assert.NotEmpty(p.PortfolioItems);
            Assert.NotEmpty(p.Availabilities);
            Assert.NotEmpty(p.ArtistStyles);
            Assert.True(p.MinSessionPrice > 0);
            Assert.True(p.HourlyRate > 0);
        });

        // Certifications, awards and sponsorships exist
        Assert.True(await context.Certifications.CountAsync(c => c.IsActive) >= 3);
        Assert.True(await context.Awards.CountAsync() >= 2);
        Assert.True(await context.Sponsorships.CountAsync() >= 3);

        // US0014 CA2: the seed covers the three relationship types
        var relationTypes = await context.Sponsorships.Select(s => s.RelationshipType).ToListAsync();
        Assert.Contains(Domain.Enums.SponsorshipRelationType.Ambassador, relationTypes);
        Assert.Contains(Domain.Enums.SponsorshipRelationType.Sponsored, relationTypes);
        Assert.Contains(Domain.Enums.SponsorshipRelationType.Certified, relationTypes);

        // Seeding twice is idempotent
        await seeder.SeedAsync();
        Assert.Equal(23, await context.Users.CountAsync());
    }
}
