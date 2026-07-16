using InkLink.Api.Domain.Entities;
using InkLink.Api.Domain.Enums;
using InkLink.Api.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace InkLink.Api.Seed;

public class DatabaseSeeder
{
    private const string SeedPassword = "Test1234!";
    private const string ImageBaseUrl = "http://localhost:9000/inklink-images";

    private readonly InkLinkDbContext _context;
    private readonly ILogger<DatabaseSeeder> _logger;

    public DatabaseSeeder(InkLinkDbContext context, ILogger<DatabaseSeeder> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        if (await _context.Users.AnyAsync(cancellationToken))
        {
            _logger.LogInformation("Seed skipped: database already contains users");
            return;
        }

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(SeedPassword);
        var now = DateTime.UtcNow;

        var styles = CreateStyles();
        var clients = CreateClients(passwordHash, now);
        var admin = CreateAdmin(passwordHash, now);
        var artists = CreateArtistsWithProfiles(passwordHash, now, styles);

        _context.TattooStyles.AddRange(styles);
        _context.Users.AddRange(clients);
        _context.Users.Add(admin);
        _context.Users.AddRange(artists.Select(a => a.User));
        _context.ArtistProfiles.AddRange(artists.Select(a => a.Profile));

        await _context.SaveChangesAsync(cancellationToken);
        _logger.LogInformation(
            "Seed completed: {Users} users, {Artists} artist profiles, {Styles} styles",
            clients.Count + artists.Count + 1, artists.Count, styles.Count);
    }

    private static List<TattooStyle> CreateStyles()
    {
        var catalog = new (string Name, string Slug)[]
        {
            ("Realismo", "realismo"), ("Tradicional", "tradicional"), ("Blackwork", "blackwork"),
            ("Fine Line", "fine-line"), ("Japonés", "japones"), ("Lettering", "lettering"),
            ("Neotradicional", "neotradicional"), ("Acuarela", "acuarela"), ("Geométrico", "geometrico"),
            ("Minimalista", "minimalista"), ("Dotwork", "dotwork"), ("Tribal", "tribal")
        };
        return catalog
            .Select(s => new TattooStyle { Id = Guid.NewGuid(), Name = s.Name, Slug = s.Slug })
            .ToList();
    }

    private static List<User> CreateClients(string passwordHash, DateTime now)
    {
        var clients = new (string Email, string First, string Last)[]
        {
            ("camila.rojas@example.cl", "Camila", "Rojas"),
            ("diego.fuentes@example.cl", "Diego", "Fuentes"),
            ("valentina.soto@example.cl", "Valentina", "Soto")
        };
        return clients.Select(c => new User
        {
            Id = Guid.NewGuid(),
            Email = c.Email,
            PasswordHash = passwordHash,
            Role = UserRole.Client,
            FirstName = c.First,
            LastName = c.Last,
            IsVerified = true,
            CreatedAt = now,
            UpdatedAt = now
        }).ToList();
    }

    private static User CreateAdmin(string passwordHash, DateTime now) => new()
    {
        Id = Guid.NewGuid(),
        Email = "admin@inklink.cl",
        PasswordHash = passwordHash,
        Role = UserRole.Admin,
        FirstName = "Admin",
        LastName = "InkLink",
        IsVerified = true,
        CreatedAt = now,
        UpdatedAt = now
    };

    private record ArtistSeed(User User, ArtistProfile Profile);

    private static List<ArtistSeed> CreateArtistsWithProfiles(
        string passwordHash, DateTime now, List<TattooStyle> styles)
    {
        // Real Santiago communes and coordinates
        var artistData = new (string Email, string First, string Last, string Slug, string Commune,
            decimal Lat, decimal Lng, ArtistType Type, int MinPrice, int HourlyRate, int YearsExp,
            string[] StyleSlugs, bool Certified, bool Awarded, bool Sponsored)[]
        {
            ("matias.ink@example.cl", "Matías", "Herrera", "matias-herrera", "Providencia",
                -33.42628000m, -70.61969000m, ArtistType.Studio, 80000, 60000, 8,
                new[] { "realismo", "blackwork" }, true, true, true),
            ("fernanda.tattoo@example.cl", "Fernanda", "Muñoz", "fernanda-munoz", "Ñuñoa",
                -33.45694000m, -70.59772000m, ArtistType.Independent, 60000, 45000, 5,
                new[] { "fine-line", "minimalista" }, true, false, true),
            ("cristobal.art@example.cl", "Cristóbal", "Vidal", "cristobal-vidal", "Santiago",
                -33.44340000m, -70.65045000m, ArtistType.Studio, 100000, 75000, 12,
                new[] { "japones", "neotradicional" }, true, true, false),
            ("antonia.lines@example.cl", "Antonia", "Reyes", "antonia-reyes", "Las Condes",
                -33.40860000m, -70.56700000m, ArtistType.Independent, 70000, 50000, 4,
                new[] { "acuarela", "geometrico" }, false, false, false),
            ("javier.dotwork@example.cl", "Javier", "Castro", "javier-castro", "Vitacura",
                -33.39000000m, -70.59500000m, ArtistType.Independent, 55000, 40000, 6,
                new[] { "dotwork", "tribal", "lettering" }, false, false, false)
        };

        var result = new List<ArtistSeed>();
        foreach (var a in artistData)
        {
            var user = new User
            {
                Id = Guid.NewGuid(),
                Email = a.Email,
                PasswordHash = passwordHash,
                Role = UserRole.Artist,
                FirstName = a.First,
                LastName = a.Last,
                IsVerified = true,
                CreatedAt = now,
                UpdatedAt = now
            };

            var profile = new ArtistProfile
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                Slug = a.Slug,
                Bio = $"Tatuador con {a.YearsExp} años de experiencia en {string.Join(", ", a.StyleSlugs)}. Estudio en {a.Commune}, Santiago.",
                YearsExperience = a.YearsExp,
                ArtistType = a.Type,
                Latitude = a.Lat,
                Longitude = a.Lng,
                Commune = a.Commune,
                MinSessionPrice = a.MinPrice,
                HourlyRate = a.HourlyRate,
                DepositPercentage = 30,
                CancellationPolicy = CancellationPolicy.Hours48,
                IsPublished = true
            };

            var artistStyles = styles.Where(s => a.StyleSlugs.Contains(s.Slug)).ToList();
            foreach (var style in artistStyles)
            {
                profile.ArtistStyles.Add(new ArtistStyle { ArtistProfileId = profile.Id, StyleId = style.Id });
            }

            for (var i = 0; i < 12; i++)
            {
                var style = artistStyles[i % artistStyles.Count];
                var imageUrl = TattooImageCatalog.GetUrl(style.Slug, i);
                profile.PortfolioItems.Add(new PortfolioItem
                {
                    Id = Guid.NewGuid(),
                    ArtistProfileId = profile.Id,
                    ImageUrl = imageUrl,
                    ThumbnailUrl = imageUrl,
                    StyleId = style.Id,
                    IsFeatured = i == 0,
                    SortOrder = i,
                    CreatedAt = now
                });
            }

            // Tuesday to Saturday, 10:00-19:00, 2-hour slots (day_of_week: 0=Monday)
            for (var day = 1; day <= 5; day++)
            {
                profile.Availabilities.Add(new Availability
                {
                    Id = Guid.NewGuid(),
                    ArtistProfileId = profile.Id,
                    DayOfWeek = day,
                    StartTime = new TimeOnly(10, 0),
                    EndTime = new TimeOnly(19, 0),
                    SlotDurationMinutes = 120,
                    IsActive = true
                });
            }

            if (a.Certified)
            {
                profile.Certifications.Add(new Certification
                {
                    Id = Guid.NewGuid(),
                    ArtistProfileId = profile.Id,
                    Type = CertificationType.Sanitary,
                    Name = "Resolución Sanitaria SEREMI RM",
                    Issuer = "SEREMI de Salud Región Metropolitana",
                    ValidUntil = DateOnly.FromDateTime(now.AddYears(1)),
                    IsActive = true
                });
            }

            if (a.Awarded)
            {
                profile.Awards.Add(new Award
                {
                    Id = Guid.NewGuid(),
                    ArtistProfileId = profile.Id,
                    Title = $"Mejor {char.ToUpper(a.StyleSlugs[0][0]) + a.StyleSlugs[0][1..]}",
                    EventName = "Expo Tattoo Santiago",
                    Year = 2025,
                    Category = a.StyleSlugs[0]
                });
            }

            if (a.Sponsored)
            {
                // US0014 CA2: the seed covers the three relationship types across artists
                var brands = a.Slug == "matias-herrera"
                    ? new[]
                    {
                        ("Eternal Ink", "eternal-ink", SponsorshipRelationType.Ambassador),
                        ("Cheyenne", "cheyenne", SponsorshipRelationType.Certified)
                    }
                    : new[]
                    {
                        ("Dynamic Color", "dynamic-color", SponsorshipRelationType.Sponsored)
                    };

                foreach (var (brandName, logoSlug, relationType) in brands)
                {
                    profile.Sponsorships.Add(new Sponsorship
                    {
                        Id = Guid.NewGuid(),
                        ArtistProfileId = profile.Id,
                        BrandName = brandName,
                        BrandLogoUrl = $"{ImageBaseUrl}/brands/{logoSlug}.png",
                        RelationshipType = relationType,
                        IsActive = true
                    });
                }
            }

            result.Add(new ArtistSeed(user, profile));
        }

        return result;
    }
}
