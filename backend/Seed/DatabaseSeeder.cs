using InkLink.Api.Domain.Entities;
using InkLink.Api.Domain.Enums;
using InkLink.Api.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace InkLink.Api.Seed;

public class DatabaseSeeder
{
    private const string SeedPassword = "Test1234!";
    private const string ImageBaseUrl = "http://localhost:9000/inklink-images";
    private const decimal CommissionRate = 0.07m; // Mirrors Platform:CommissionRate default

    // Unsplash photo IDs taken from the Figma Make prototype (fixs/figma-design/src/app/App.tsx)
    private static readonly string[] GalleryImageIds =
    [
        "photo-1568515045052-f9a854d70bfd",
        "photo-1597852075234-fd721ac361d3",
        "photo-1565058379802-bbe93b2f703a",
        "photo-1643513456892-437e82e06f4a",
        "photo-1479767574301-a01c78234a0c",
        "photo-1519822356-4853be4346a8",
        "photo-1724343163782-52276ca2e6c2",
        "photo-1759247943101-f1b32bcc6a8b",
        "photo-1561377455-190afb395ed7",
        "photo-1588417490421-63d4e4175f95",
        "photo-1712432321375-226f466fff85",
        "photo-1775135332562-9ff99e65a616"
    ];

    // One representative image per style (prototype ESTILOS_IMG map)
    private static readonly IReadOnlyDictionary<string, string> StyleImageIds = new Dictionary<string, string>
    {
        ["realismo"] = "photo-1519822356-4853be4346a8",
        ["tradicional"] = "photo-1568515045052-f9a854d70bfd",
        ["blackwork"] = "photo-1597852075234-fd721ac361d3",
        ["fine-line"] = "photo-1479767574301-a01c78234a0c",
        ["japones"] = "photo-1565058379802-bbe93b2f703a",
        ["lettering"] = "photo-1588417490421-63d4e4175f95",
        ["neotradicional"] = "photo-1643513456892-437e82e06f4a",
        ["acuarela"] = "photo-1724343163782-52276ca2e6c2",
        ["geometrico"] = "photo-1561377455-190afb395ed7",
        ["minimalista"] = "photo-1759247943101-f1b32bcc6a8b",
        ["dotwork"] = "photo-1712432321375-226f466fff85",
        ["tribal"] = "photo-1607943917700-18ec6ff5a4c2"
    };

    // Portrait photos reused from the prototype review avatars
    private static readonly string[] PortraitImageIds =
    [
        "photo-1577357922830-eae2e1c7b4de",
        "photo-1671695157166-c4bbd8e6e94e",
        "photo-1687825495498-1bb4c92dbb19",
        "photo-1724343163782-52276ca2e6c2",
        "photo-1781258606224-c010bc4a642a",
        "photo-1759247943101-f1b32bcc6a8b"
    ];

    private readonly InkLinkDbContext _context;
    private readonly ILogger<DatabaseSeeder> _logger;

    public DatabaseSeeder(InkLinkDbContext context, ILogger<DatabaseSeeder> logger)
    {
        _context = context;
        _logger = logger;
    }

    private static string Unsplash(string id, int w, int h) =>
        $"https://images.unsplash.com/{id}?w={w}&h={h}&fit=crop&auto=format";

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
        var (bookings, payments, reviews) = CreateReviewsWithBookings(artists, clients, now);
        AddReviewableBookings(bookings, payments, artists, clients, now);

        _context.TattooStyles.AddRange(styles);
        _context.Users.AddRange(clients);
        _context.Users.Add(admin);
        _context.Users.AddRange(artists.Select(a => a.User));
        _context.ArtistProfiles.AddRange(artists.Select(a => a.Profile));
        _context.Bookings.AddRange(bookings);
        _context.Payments.AddRange(payments);
        _context.Reviews.AddRange(reviews);

        await _context.SaveChangesAsync(cancellationToken);
        _logger.LogInformation(
            "Seed completed: {Users} users, {Artists} artist profiles, {Styles} styles, {Reviews} reviews",
            clients.Count + artists.Count + 1, artists.Count, styles.Count, reviews.Count);
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
        // camila.rojas and rodrigo@syntaxis.cl are login fixtures used by docs/tests — keep them
        var clients = new (string Email, string First, string Last)[]
        {
            ("camila.rojas@example.cl", "Camila", "Rojas"),
            ("diego.fuentes@example.cl", "Diego", "Fuentes"),
            ("valentina.soto@example.cl", "Valentina", "Soto"),
            ("rodrigo@syntaxis.cl", "Rodrigo", "Chamy"),
            ("sofia.alarcon@example.cl", "Sofía", "Alarcón"),
            ("tomas.munoz@example.cl", "Tomás", "Muñoz"),
            ("javiera.rojas@example.cl", "Javiera", "Rojas"),
            ("camilo.reyes@example.cl", "Camilo", "Reyes")
        };
        return clients.Select((c, i) => new User
        {
            Id = Guid.NewGuid(),
            Email = c.Email,
            PasswordHash = passwordHash,
            Role = UserRole.Client,
            FirstName = c.First,
            LastName = c.Last,
            AvatarUrl = Unsplash(PortraitImageIds[i % PortraitImageIds.Length], 200, 200),
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

    internal record ArtistSeed(User User, ArtistProfile Profile);

    private sealed record ArtistData(
        string Email, string First, string Last, string Slug, string Commune, string Address,
        decimal Lat, decimal Lng, ArtistType Type, int MinPrice, int HourlyRate, int YearsExp,
        int DepositPct, CancellationPolicy Cancellation, string[] StyleSlugs, int PortfolioCount,
        string AvatarId, string Bio,
        (CertificationType Type, string Name, string Issuer, int MonthsValid)[] Certifications,
        (string Title, string Event, int Year, string Category)[] Awards,
        (string Brand, string LogoSlug, SponsorshipRelationType Relation)[] Sponsorships);

    private static ArtistData[] GetArtistData() =>
    [
        // ── Original five artists (slugs referenced by docs/tests — do not rename) ──
        new("matias.ink@example.cl", "Matías", "Herrera", "matias-herrera", "Providencia",
            "Av. Providencia 2124, of. 304", -33.42628000m, -70.61969000m, ArtistType.Studio,
            80000, 60000, 8, 30, CancellationPolicy.Hours48,
            ["realismo", "blackwork"], 12, "photo-1671695157166-c4bbd8e6e94e",
            "El blackwork y el realismo son mi lenguaje. Trabajo con geometría, sombras profundas y retratos de alto contraste. Cada diseño es original — no hago flash. Estudio privado en Providencia con esterilización certificada.",
            [(CertificationType.Sanitary, "Resolución Sanitaria SEREMI RM", "SEREMI de Salud Región Metropolitana", 14)],
            [("Mejor Realismo", "Expo Tattoo Santiago", 2025, "realismo")],
            [("Eternal Ink", "eternal-ink", SponsorshipRelationType.Ambassador),
             ("Cheyenne", "cheyenne", SponsorshipRelationType.Certified)]),
        new("fernanda.tattoo@example.cl", "Fernanda", "Muñoz", "fernanda-munoz", "Ñuñoa",
            "Irarrázaval 3150, local 8", -33.45694000m, -70.59772000m, ArtistType.Independent,
            60000, 45000, 5, 25, CancellationPolicy.Hours24,
            ["fine-line", "minimalista"], 10, "photo-1577357922830-eae2e1c7b4de",
            "Trazos delicados y diseños minimalistas con intención. Me especializo en fine-line botánico y piezas pequeñas con mucho detalle. Atiendo en un espacio tranquilo en Ñuñoa donde tu comodidad es lo primero.",
            [(CertificationType.Sanitary, "Resolución Sanitaria SEREMI RM", "SEREMI de Salud Región Metropolitana", 10)],
            [],
            [("Dynamic Color", "dynamic-color", SponsorshipRelationType.Sponsored)]),
        new("cristobal.art@example.cl", "Cristóbal", "Vidal", "cristobal-vidal", "Santiago Centro",
            "Merced 380, piso 3", -33.44340000m, -70.65045000m, ArtistType.Studio,
            100000, 75000, 12, 30, CancellationPolicy.Hours72,
            ["japones", "neotradicional"], 11, "photo-1724343163782-52276ca2e6c2",
            "Doce años dedicados al irezumi y al neotradicional. Mis piezas son narrativas visuales — dragones, carpas, oni — pensadas para durar décadas. Dirijo un estudio en pleno centro de Santiago con protocolos de bioseguridad estrictos.",
            [(CertificationType.Sanitary, "Resolución Sanitaria SEREMI RM", "SEREMI de Salud Región Metropolitana", 12),
             (CertificationType.Municipal, "Patente Municipal", "Municipalidad de Santiago", 11)],
            [("Mejor Pieza Oriental", "Valparaíso Tattoo Fest", 2024, "japones")],
            []),
        new("antonia.lines@example.cl", "Antonia", "Reyes", "antonia-reyes", "Las Condes",
            "Av. Apoquindo 4700, of. 1203", -33.40860000m, -70.56700000m, ArtistType.Independent,
            70000, 50000, 4, 35, CancellationPolicy.Hours48,
            ["acuarela", "geometrico"], 9, "photo-1687825495498-1bb4c92dbb19",
            "Acuarela y geometría: color que fluye sobre estructuras precisas. Formada en diseño, cada pieza que hago mezcla ilustración y tatuaje. Atiendo con hora agendada en Las Condes.",
            [], [], []),
        new("javier.dotwork@example.cl", "Javier", "Castro", "javier-castro", "Vitacura",
            "Av. Vitacura 3568, local 2", -33.39000000m, -70.59500000m, ArtistType.Independent,
            55000, 40000, 6, 25, CancellationPolicy.Hours24,
            ["dotwork", "tribal", "lettering"], 12, "photo-1759247943101-f1b32bcc6a8b",
            "Dotwork, tribal y lettering hechos punto a punto. Mis diseños toman inspiración en las culturas polinesia y maorí, adaptados a la anatomía de cada cliente. Trabajo con autoclave y materiales desechables.",
            [(CertificationType.Sanitary, "Resolución Sanitaria SEREMI RM", "SEREMI de Salud Región Metropolitana", 9)],
            [], []),

        // ── Artists ported from the Figma Make prototype ──
        new("valentina.ink@example.cl", "Valentina", "Cortés", "valentina-cortes", "Providencia",
            "Av. Providencia 2390, of. 41", -33.42550000m, -70.61100000m, ArtistType.Independent,
            45000, 60000, 10, 30, CancellationPolicy.Hours48,
            ["realismo", "fine-line", "minimalista"], 12, "photo-1577357922830-eae2e1c7b4de",
            "Hola, soy Vale. Llevo más de 10 años tatuando y me especializo en realismo y fine-line. Cada pieza que creo es única y diseñada especialmente para ti. Trabajo en un espacio privado, limpio y certificado, donde tu comodidad y seguridad son lo primero.",
            [(CertificationType.Sanitary, "Resolución Sanitaria MINSAL", "Ministerio de Salud", 14),
             (CertificationType.Biosecurity, "Curso de Bioseguridad", "Cruz Roja Chile", 8)],
            [("Mejor Realismo Color", "Santiago Tattoo Show", 2024, "realismo"),
             ("Artista del Año", "Ink Masters Chile", 2023, "general")],
            []),
        new("camila.irezumi@example.cl", "Camila", "Vega", "camila-vega", "Barrio Italia",
            "Av. Italia 1780 — Dark Matter Studio", -33.44910000m, -70.62700000m, ArtistType.Studio,
            50000, 75000, 13, 30, CancellationPolicy.Hours72,
            ["japones", "neotradicional", "acuarela"], 12, "photo-1687825495498-1bb4c92dbb19",
            "Formada en el irezumi tradicional japonés, fusiono la técnica oriental con una sensibilidad contemporánea. Mis piezas son narrativas visuales — dragones, carpas, oni — con un acabado que dura décadas. Soy artista residente en Dark Matter Studio, Barrio Italia.",
            [(CertificationType.Sanitary, "Resolución Sanitaria MINSAL", "Ministerio de Salud", 12),
             (CertificationType.Biosecurity, "Curso de Bioseguridad", "Cruz Roja Chile", 9),
             (CertificationType.Municipal, "Patente Municipal", "Municipalidad de Providencia", 11)],
            [("Mejor Pieza Oriental", "Valparaíso Tattoo Fest", 2024, "japones"),
             ("Best in Show", "Santiago Tattoo Show", 2022, "general")],
            [("Eternal Ink", "eternal-ink", SponsorshipRelationType.Sponsored)]),
        new("rodrigo.letters@example.cl", "Rodrigo", "Soto", "rodrigo-soto", "Bellavista",
            "Constitución 187, depto 2B", -33.43240000m, -70.63450000m, ArtistType.Independent,
            30000, 40000, 6, 20, CancellationPolicy.Hours24,
            ["lettering", "minimalista", "fine-line"], 8, "photo-1724343163782-52276ca2e6c2",
            "Lettering, tipografía y trazos minimalistas. Creo frases, poemas y citas que acompañan para siempre. Trabajo fine-line con una aguja y mucha paciencia. Si tienes palabras que quieres llevar en la piel, este es tu lugar.",
            [], [], []),
        new("diego.tribal@example.cl", "Diego", "Fuenzalida", "diego-fuenzalida", "Las Condes",
            "El Bosque Norte 134, piso 2 — Obsidian Arts", -33.41100000m, -70.57350000m, ArtistType.Studio,
            40000, 55000, 9, 25, CancellationPolicy.Hours48,
            ["tribal", "dotwork", "blackwork"], 10, "photo-1759247943101-f1b32bcc6a8b",
            "Especialista en tatuaje tribal y dotwork. Mis diseños toman inspiración en las culturas maorí, polinesia y maya, adaptados a la anatomía de cada cliente. Trabajo en Obsidian Arts con esterilización en autoclave.",
            [(CertificationType.Sanitary, "Resolución Sanitaria MINSAL", "Ministerio de Salud", 10)],
            [("Best Tribal", "Chile Tattoo Expo", 2024, "tribal")],
            [("Cheyenne", "cheyenne", SponsorshipRelationType.Sponsored)]),
        new("isadora.acuarela@example.cl", "Isadora", "Paz", "isadora-paz", "Vitacura",
            "Alonso de Córdova 3107, local 3", -33.38850000m, -70.60100000m, ArtistType.Independent,
            55000, 80000, 8, 35, CancellationPolicy.Hours72,
            ["acuarela", "neotradicional", "fine-line"], 10, "photo-1781258606224-c010bc4a642a",
            "El tatuaje acuarela es delicado, expresivo y único. Cada pieza que hago captura el fluir de los colores como si fueran manchas de tinta sobre papel húmedo. Formada en bellas artes, mezclo ilustración y tatuaje en cada sesión.",
            [(CertificationType.Sanitary, "Resolución Sanitaria MINSAL", "Ministerio de Salud", 13),
             (CertificationType.Municipal, "Patente Municipal", "Municipalidad de Vitacura", 10)],
            [("Mejor Acuarela", "Ink Masters Chile", 2023, "acuarela")],
            []),
        new("benjamin.oldschool@example.cl", "Benjamín", "Araya", "benjamin-araya", "Barrio Italia",
            "Av. Italia 1439 — Barrio Ink", -33.45080000m, -70.62880000m, ArtistType.Studio,
            45000, 50000, 11, 30, CancellationPolicy.Hours48,
            ["tradicional", "neotradicional"], 11, "photo-1671695157166-c4bbd8e6e94e",
            "Tradicional americano de la vieja escuela: líneas gruesas, colores sólidos y diseños que envejecen bien. Golondrinas, dagas, rosas y pin-ups con el oficio de más de una década. Artista residente en Barrio Ink.",
            [(CertificationType.Sanitary, "Resolución Sanitaria SEREMI RM", "SEREMI de Salud Región Metropolitana", 11)],
            [("Best Traditional", "Chile Tattoo Expo", 2024, "tradicional")],
            [("Dynamic Color", "dynamic-color", SponsorshipRelationType.Ambassador)]),
        new("trinidad.blackwork@example.cl", "Trinidad", "Lagos", "trinidad-lagos", "Bellavista",
            "Dardignac 64 — Neon Temple", -33.43000000m, -70.63900000m, ArtistType.Studio,
            50000, 55000, 7, 25, CancellationPolicy.Hours48,
            ["blackwork", "geometrico", "dotwork"], 10, "photo-1577357922830-eae2e1c7b4de",
            "Blackwork y geometría sagrada: mandalas, patrones ópticos y composiciones que se adaptan al cuerpo. Trabajo en Neon Temple, Bellavista, un estudio pensado para que la sesión sea una experiencia completa.",
            [(CertificationType.Sanitary, "Resolución Sanitaria SEREMI RM", "SEREMI de Salud Región Metropolitana", 12)],
            [],
            [("Eternal Ink", "eternal-ink", SponsorshipRelationType.Certified)]),
        new("ignacio.realismo@example.cl", "Ignacio", "Riquelme", "ignacio-riquelme", "La Reina",
            "Av. Príncipe de Gales 7205", -33.44500000m, -70.55300000m, ArtistType.Independent,
            75000, 65000, 9, 30, CancellationPolicy.Hours48,
            ["realismo", "japones"], 11, "photo-1671695157166-c4bbd8e6e94e",
            "Retratos en blanco y negro y piezas orientales de gran formato. Me obsesiona el detalle: texturas de piel, miradas y sombras que parecen fotografía. Atiendo solo con proyecto previo conversado.",
            [(CertificationType.Sanitary, "Resolución Sanitaria SEREMI RM", "SEREMI de Salud Región Metropolitana", 13),
             (CertificationType.Biosecurity, "Curso de Bioseguridad", "Cruz Roja Chile", 7)],
            [("Best Realism", "Chile Tattoo Expo", 2024, "realismo")],
            []),
        new("josefa.oldlines@example.cl", "Josefa", "Contreras", "josefa-contreras", "Macul",
            "Av. Macul 3841", -33.48700000m, -70.59900000m, ArtistType.Independent,
            35000, 38000, 5, 20, CancellationPolicy.Hours24,
            ["tradicional", "lettering"], 9, "photo-1781258606224-c010bc4a642a",
            "Tradicional y lettering con espíritu de barrio. Flash propio todos los meses y precios accesibles sin sacrificar calidad ni higiene. Agenda abierta en Macul.",
            [(CertificationType.Sanitary, "Resolución Sanitaria SEREMI RM", "SEREMI de Salud Región Metropolitana", 8)],
            [], [])
    ];

    private static List<ArtistSeed> CreateArtistsWithProfiles(
        string passwordHash, DateTime now, List<TattooStyle> styles)
    {
        var artistData = GetArtistData();
        var result = new List<ArtistSeed>();
        var artistIndex = 0;
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
                AvatarUrl = Unsplash(a.AvatarId, 200, 200),
                IsVerified = true,
                CreatedAt = now,
                UpdatedAt = now
            };

            var profile = new ArtistProfile
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                Slug = a.Slug,
                Bio = a.Bio,
                YearsExperience = a.YearsExp,
                ArtistType = a.Type,
                Latitude = a.Lat,
                Longitude = a.Lng,
                Address = a.Address,
                Commune = a.Commune,
                MinSessionPrice = a.MinPrice,
                HourlyRate = a.HourlyRate,
                DepositPercentage = a.DepositPct,
                CancellationPolicy = a.Cancellation,
                IsPublished = true
            };

            // Preserve the declared style order (important for portfolio round-robin)
            var artistStyles = a.StyleSlugs
                .Select(slug => styles.Single(s => s.Slug == slug))
                .ToList();
            foreach (var style in artistStyles)
            {
                profile.ArtistStyles.Add(new ArtistStyle { ArtistProfileId = profile.Id, StyleId = style.Id });
            }

            for (var i = 0; i < a.PortfolioCount; i++)
            {
                var style = artistStyles[i % artistStyles.Count];
                // Figma approach: each artist gets a rotated view of the gallery
                var imageUrl = TattooImageCatalog.GetPortfolioUrl(artistIndex, i);
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

            foreach (var cert in a.Certifications)
            {
                profile.Certifications.Add(new Certification
                {
                    Id = Guid.NewGuid(),
                    ArtistProfileId = profile.Id,
                    Type = cert.Type,
                    Name = cert.Name,
                    Issuer = cert.Issuer,
                    ValidUntil = DateOnly.FromDateTime(now.AddMonths(cert.MonthsValid)),
                    IsActive = true
                });
            }

            foreach (var award in a.Awards)
            {
                profile.Awards.Add(new Award
                {
                    Id = Guid.NewGuid(),
                    ArtistProfileId = profile.Id,
                    Title = award.Title,
                    EventName = award.Event,
                    Year = award.Year,
                    Category = award.Category
                });
            }

            // US0014 CA2: across artists the seed covers the three relationship types
            foreach (var (brandName, logoSlug, relationType) in a.Sponsorships)
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

            result.Add(new ArtistSeed(user, profile));
            artistIndex++;
        }

        return result;
    }

    // Review comments in Spanish, adapted from the prototype RESENAS_* fixtures
    private static readonly string[] ReviewComments =
    [
        "Transformó mi idea en algo que supera todo lo que imaginé. El realismo del retrato es increíble. El espacio fue súper limpio y estuvo atenta en todo momento.",
        "Me hice el antebrazo completo en dos sesiones. El nivel de detalle en las flores y el sombreado es de otro nivel. La sesión fue cómoda y bien explicada.",
        "Era mi primer tatuaje y estaba con nervios. Me explicaron todo el proceso, me ayudaron a elegir el lugar y el diseño. No pude pedir mejor primera experiencia.",
        "Muy buen trabajo. El diseño quedó perfecto. Solo quitaría una estrella porque tuve que esperar 15 minutos, pero valió la pena totalmente.",
        "La plataforma me dio toda la confianza que necesitaba. Reseñas verificadas, depósito seguro y el resultado es un crack total.",
        "El cotizador me dio el precio exacto antes de reservar. Sin sorpresas, sin esperar DMs. El estudio impecable y el trato de primera.",
        "Llegué con una referencia y salí con algo mucho mejor. Se nota la experiencia: líneas limpias, buena mano y excelente manejo del dolor.",
        "Todo impecable: materiales sellados frente a mí, guantes nuevos y explicación del cuidado posterior. El tatuaje sanó perfecto.",
        "Segunda vez que me tatúo aquí y no será la última. Puntualidad, buena música y un resultado que todos me comentan.",
        "El diseño personalizado superó mis expectativas. Me mandó bocetos antes de la sesión y ajustamos juntos cada detalle.",
        "Excelente experiencia de principio a fin. La reserva fue fácil, el depósito quedó claro y la sesión salió tal como se cotizó.",
        "Una artista tremenda y un espacio muy acogedor. Me sentí en confianza durante toda la sesión y el resultado es precioso."
    ];

    // 4-dimension rating tuples (hygiene, pain, service, result), all high per prototype
    private static readonly (int H, int P, int S, int R)[] RatingSets =
    [
        (5, 5, 5, 5), (5, 4, 5, 5), (5, 5, 4, 5), (4, 4, 5, 5), (5, 4, 4, 5), (5, 5, 5, 4)
    ];

    private static readonly string[] BodyZones =
        ["Antebrazo", "Brazo", "Espalda", "Pierna", "Muslo", "Pecho", "Costillas", "Tobillo"];

    private static (List<Booking> Bookings, List<Payment> Payments, List<Review> Reviews)
        CreateReviewsWithBookings(List<ArtistSeed> artists, List<User> clients, DateTime now)
    {
        // Reviews per artist, aligned with GetArtistData() order (most artists get 2-6)
        int[] reviewCounts = [6, 4, 5, 3, 4, 6, 6, 2, 3, 4, 3, 3, 4, 2];

        var bookings = new List<Booking>();
        var payments = new List<Payment>();
        var reviews = new List<Review>();
        var sequence = 0;

        for (var artistIndex = 0; artistIndex < artists.Count; artistIndex++)
        {
            var profile = artists[artistIndex].Profile;
            var count = reviewCounts[artistIndex % reviewCounts.Length];
            var artistReviews = new List<Review>();

            for (var i = 0; i < count; i++)
            {
                sequence++;
                var client = clients[(artistIndex + i) % clients.Count];
                var style = profile.ArtistStyles.ElementAt(i % profile.ArtistStyles.Count);
                var bookingDate = DateOnly.FromDateTime(now.AddDays(-(14 + sequence * 3)));
                var startTime = new TimeOnly(10 + (i % 4) * 2, 0);
                var priceMin = profile.MinSessionPrice;
                var priceMax = priceMin + profile.HourlyRate;
                var deposit = (int)Math.Round(
                    priceMin * (profile.DepositPercentage / 100.0m), MidpointRounding.AwayFromZero);

                var booking = new Booking
                {
                    Id = Guid.NewGuid(),
                    ClientId = client.Id,
                    ArtistProfileId = profile.Id,
                    BookingDate = bookingDate,
                    StartTime = startTime,
                    EndTime = startTime.AddHours(2),
                    Status = BookingStatus.Completed,
                    EstimatedPriceMin = priceMin,
                    EstimatedPriceMax = priceMax,
                    DepositAmount = deposit,
                    BodyZone = BodyZones[sequence % BodyZones.Length],
                    SizeReference = "Palma (~8 cm)",
                    StyleId = style.StyleId,
                    IsColor = i % 2 == 0,
                    IsCoverup = false,
                    CreatedAt = now.AddDays(-(21 + sequence * 3))
                };
                bookings.Add(booking);

                var platformFee = (int)Math.Round(deposit * CommissionRate, MidpointRounding.AwayFromZero);
                payments.Add(new Payment
                {
                    Id = Guid.NewGuid(),
                    BookingId = booking.Id,
                    FlowTransactionId = $"SEED-{sequence:D4}",
                    Amount = deposit,
                    PlatformFee = platformFee,
                    ArtistAmount = deposit - platformFee,
                    Status = PaymentStatus.Completed,
                    PaidAt = booking.CreatedAt.AddMinutes(5)
                });

                // Offset by artist index so aggregate averages differ per artist
                var ratings = RatingSets[(artistIndex + i) % RatingSets.Length];
                var withPhoto = i % 3 == 0;
                artistReviews.Add(new Review
                {
                    Id = Guid.NewGuid(),
                    BookingId = booking.Id,
                    ClientId = client.Id,
                    ArtistProfileId = profile.Id,
                    RatingHygiene = ratings.H,
                    RatingPainManagement = ratings.P,
                    RatingCustomerService = ratings.S,
                    RatingResult = ratings.R,
                    Comment = ReviewComments[(sequence - 1) % ReviewComments.Length],
                    TattooPhotoUrl = withPhoto
                        ? Unsplash(GalleryImageIds[(artistIndex + i) % GalleryImageIds.Length], 400, 400)
                        : null,
                    CreatedAt = now.AddDays(-(7 + sequence * 3))
                });
            }

            reviews.AddRange(artistReviews);

            // Keep aggregates consistent with ReviewService's SQL recalculation:
            // ROUND(AVG((h + p + s + r) / 4.0), 2) and COUNT(*)
            profile.RatingAvg = Math.Round(
                artistReviews.Average(r =>
                    (r.RatingHygiene + r.RatingPainManagement + r.RatingCustomerService + r.RatingResult) / 4.0m),
                2, MidpointRounding.AwayFromZero);
            profile.TotalReviews = artistReviews.Count;
        }

        return (bookings, payments, reviews);
    }

    /// <summary>
    /// Add completed bookings without reviews so clients can test the review flow.
    /// Each client gets one reviewable booking.
    /// </summary>
    private static void AddReviewableBookings(
        List<Booking> bookings, List<Payment> payments,
        List<ArtistSeed> artists, List<User> clients, DateTime now)
    {
        for (var i = 0; i < Math.Min(clients.Count, artists.Count); i++)
        {
            var client = clients[i];
            var profile = artists[(i + 3) % artists.Count].Profile;
            var style = profile.ArtistStyles.First();
            var bookingDate = DateOnly.FromDateTime(now.AddDays(-(7 + i * 2)));
            var deposit = (int)Math.Round(
                profile.MinSessionPrice * (profile.DepositPercentage / 100.0m), MidpointRounding.AwayFromZero);

            var booking = new Booking
            {
                Id = Guid.NewGuid(),
                ClientId = client.Id,
                ArtistProfileId = profile.Id,
                BookingDate = bookingDate,
                StartTime = new TimeOnly(14, 0),
                EndTime = new TimeOnly(16, 0),
                Status = BookingStatus.Completed,
                EstimatedPriceMin = profile.MinSessionPrice,
                EstimatedPriceMax = profile.MinSessionPrice + profile.HourlyRate,
                DepositAmount = deposit,
                BodyZone = BodyZones[i % BodyZones.Length],
                SizeReference = "Palma (~8 cm)",
                StyleId = style.StyleId,
                IsColor = i % 2 == 0,
                IsCoverup = false,
                CreatedAt = now.AddDays(-(14 + i * 2))
            };
            bookings.Add(booking);

            var platformFee = (int)Math.Round(deposit * CommissionRate, MidpointRounding.AwayFromZero);
            payments.Add(new Payment
            {
                Id = Guid.NewGuid(),
                BookingId = booking.Id,
                FlowTransactionId = $"SEED-NOREVIEW-{i:D2}",
                Amount = deposit,
                PlatformFee = platformFee,
                ArtistAmount = deposit - platformFee,
                Status = PaymentStatus.Completed,
                PaidAt = booking.CreatedAt.AddMinutes(5)
            });
        }
    }
}
