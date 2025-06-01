using ConsultCore31.Core.Entities;
using ConsultCore31.Infrastructure;
using ConsultCore31.Infrastructure.Persistence.Context;
using ConsultCore31.WebAPI.Configurations;
using ConsultCore31.WebAPI.Extensions;
using ConsultCore31.WebAPI.Services;
using ConsultCore31.WebAPI.Services.Interfaces;

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

using Polly;
using Polly.Extensions.Http;

using Scalar.AspNetCore;

using System.Reflection;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Configuración de CORS
var corsSettings = builder.Configuration.GetSection("Cors").Get<CorsSettings>();
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy =>
    {
        policy.WithOrigins(corsSettings?.AllowedOrigins ?? Array.Empty<string>())
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Configuración de la base de datos
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        sqlServerOptions =>
        {
            sqlServerOptions.MigrationsAssembly(typeof(AppDbContext).Assembly.FullName);
            sqlServerOptions.EnableRetryOnFailure(
                maxRetryCount: 5,
                maxRetryDelay: TimeSpan.FromSeconds(30),
                errorNumbersToAdd: null);
        }));

// Configuración de controladores y JSON
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
        options.JsonSerializerOptions.WriteIndented = true;

        // Configuración para mejorar el rendimiento
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

// Configuración de servicios HTTP con compresión
double.TryParse(builder.Configuration["RequestTimeoutInMinutes"], out var requestTimeoutInMinutes);

// Configurar cliente HTTP con políticas de reintento
var httpClientBuilder = builder.Services.AddHttpClient("DefaultClient", client =>
{
    client.Timeout = TimeSpan.FromMinutes(requestTimeoutInMinutes > 0 ? requestTimeoutInMinutes : 2);
})
.ConfigurePrimaryHttpMessageHandler(() => new HttpClientHandler
{
    ServerCertificateCustomValidationCallback = (message, cert, chain, errors) => true
});

// Configurar políticas de reintento
var retryPolicy = HttpPolicyExtensions
    .HandleTransientHttpError()
    .WaitAndRetryAsync(3, retryAttempt =>
        TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)));

// Configurar política de cortocircuito
var circuitBreakerPolicy = HttpPolicyExtensions
    .HandleTransientHttpError()
    .CircuitBreakerAsync(5, TimeSpan.FromSeconds(30));

// Aplicar políticas al cliente HTTP
httpClientBuilder
    .SetHandlerLifetime(TimeSpan.FromMinutes(5))
    .AddPolicyHandler(retryPolicy)
    .AddPolicyHandler(circuitBreakerPolicy);

// Configuración de la base de datos
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"),
    sqlServerOptions => sqlServerOptions.CommandTimeout(120)));

// Registrar servicios de aplicación
builder.Services.AddApplicationServices();

// Configuración de Identity
builder.Services.AddIdentity<Usuario, IdentityRole<int>>()
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();

// Configuración de las opciones de Identity
builder.Services.Configure<IdentityOptions>(options =>
{
    // Configuración de contraseña
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = true;
    options.Password.RequiredLength = 8;

    // Configuración de usuario
    options.User.RequireUniqueEmail = true;

    // Configuración de bloqueo de cuenta
    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
    options.Lockout.MaxFailedAccessAttempts = 5;
    options.Lockout.AllowedForNewUsers = true;
});

// Configuración de OpenAPI para Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "ConsultCore31 API", Version = "v1" });

    // Configuración de seguridad JWT en Swagger
    var securityScheme = new OpenApiSecurityScheme
    {
        Name = "JWT Authentication",
        Description = "Ingrese el token JWT de la siguiente forma: Bearer {token}",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        Reference = new OpenApiReference
        {
            Id = JwtBearerDefaults.AuthenticationScheme,
            Type = ReferenceType.SecurityScheme
        }
    };

    c.AddSecurityDefinition(securityScheme.Reference.Id, securityScheme);
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        { securityScheme, Array.Empty<string>() }
    });

    // Configuración adicional de Swagger
    c.DescribeAllParametersInCamelCase();

    // Configuración para generar documentación XML
    var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    c.IncludeXmlComments(xmlPath);
});

// Configuración de Scalar - No se requiere configuración de servicios adicional en esta versión

// Configuración de JWT
var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>();

if (jwtSettings == null || string.IsNullOrEmpty(jwtSettings.SecretKey))
{
    throw new InvalidOperationException("La configuración de JWT no es válida o falta la clave secreta.");
}

var tokenValidationParameters = new TokenValidationParameters
{
    ValidateIssuer = true,
    ValidIssuer = jwtSettings.Issuer,
    ValidateAudience = true,
    ValidAudience = jwtSettings.Audience,
    ValidateIssuerSigningKey = true,
    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.SecretKey)),
    ValidateLifetime = true,
    ClockSkew = TimeSpan.Zero
};

builder.Services.AddSingleton(tokenValidationParameters);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.SaveToken = true;
    options.RequireHttpsMetadata = false;
    options.TokenValidationParameters = tokenValidationParameters;

    // Manejo de eventos personalizados
    options.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = context =>
        {
            if (context.Exception.GetType() == typeof(SecurityTokenExpiredException))
            {
                context.Response.Headers.Append("Token-Expired", "true");
            }
            return Task.CompletedTask;
        },
        OnTokenValidated = context =>
        {
            // Aquí puedes agregar lógica adicional cuando el token es válido
            return Task.CompletedTask;
        }
    };
});

// Configuración de la inyección de dependencias
builder.Services.AddInfrastructure(builder.Configuration);

// Registrar configuraciones
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));
builder.Services.Configure<CorsSettings>(builder.Configuration.GetSection("Cors"));

// Registrar servicios de autenticación
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IAuthService, AuthService>();

// Configuración de caché distribuido (puede ser Redis, SQL Server, etc.)
builder.Services.AddDistributedMemoryCache();

// Configuración de respuesta comprimida
builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
    options.Providers.Add<BrotliCompressionProvider>();
    options.Providers.Add<GzipCompressionProvider>();
    options.MimeTypes = ResponseCompressionDefaults.MimeTypes.Concat(
        new[] { "application/octet-stream" });
});

// Configuración de los niveles de compresión
builder.Services.Configure<BrotliCompressionProviderOptions>(options =>
{
    options.Level = System.IO.Compression.CompressionLevel.Optimal;
});

builder.Services.Configure<GzipCompressionProviderOptions>(options =>
{
    options.Level = System.IO.Compression.CompressionLevel.Optimal;
});

// Configuración de AutoMapper
builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

// Configuración de la versión de la API
builder.Services.AddApiVersioning(options =>
{
    options.DefaultApiVersion = new ApiVersion(1, 0);
    options.AssumeDefaultVersionWhenUnspecified = true;
    options.ReportApiVersions = true;
});

var app = builder.Build();

// Configuración del pipeline de solicitudes HTTP
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();

    // Configuración de Swagger
    app.UseSwagger(c =>
    {
        c.RouteTemplate = "openapi/{documentName}.json";
    });

    // Configuración de Swagger UI
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/openapi/v1.json", "ConsultCore31 API V1");
        c.OAuthClientId("swagger-ui");
        c.OAuthClientSecret("swagger-ui-secret");
        c.OAuthUsePkce();
    });
}

// Configuración de CORS
app.UseCors("CorsPolicy");

// Autenticación y Autorización
app.UseAuthentication();
app.UseAuthorization();

// Compresión de respuestas
app.UseResponseCompression();

// Mapeo de controladores
app.MapControllers();

// Health check endpoint
app.MapGet("/health", () => Results.Ok(new { status = "Healthy", timestamp = DateTime.UtcNow }));

// Inicialización de la base de datos
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();
        await context.Database.MigrateAsync();

        // Aquí puedes agregar la inicialización de datos si es necesario
        // await DbInitializer.Initialize(context, services);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Ocurrió un error al inicializar la base de datos");
    }
}

// Configuración de la canalización de middleware
app.UseHttpsRedirection();
app.UseRouting();

// Habilitar CORS antes de los controladores
app.UseCors("CorsPolicy");

// Habilitar compresión de respuestas
app.UseResponseCompression();

// Configuración de seguridad de encabezados HTTP
var cachePeriod = builder.Environment.IsDevelopment() ? "600" : "2592000";
app.Use(async (context, next) =>
{
    var headers = context.Response.Headers;

    // Eliminar encabezados si ya existen
    headers.Remove("X-Content-Type-Options");
    headers.Remove("X-Frame-Options");
    headers.Remove("X-XSS-Protection");
    headers.Remove("Referrer-Policy");
    headers.Remove("Content-Security-Policy");
    headers.Remove("Cache-Control");
    headers.Remove("Strict-Transport-Security");

    // Agregar encabezados de seguridad
    headers.Append("X-Content-Type-Options", "nosniff");
    headers.Append("X-Frame-Options", "DENY");
    headers.Append("X-XSS-Protection", "1; mode=block");
    headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");
    headers.Append("Content-Security-Policy",
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data:; " +
        "font-src 'self'");

    headers.Append("Cache-Control", $"public, max-age={cachePeriod}");
    headers.Append("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");

    await next();
});

// Autenticación y autorización
app.UseAuthentication();
app.UseAuthorization();

// Middleware personalizado para manejo de errores global
app.UseExceptionHandler("/error");

// Mapeo de controladores
app.MapControllers();

// Configuración de Swagger
if (app.Environment.IsDevelopment())
{
    app.UseSwagger(c =>
    {
        c.RouteTemplate = "openapi/{documentName}.json";
    });

    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/openapi/v1.json", "ConsultCore31 API V1");
        c.RoutePrefix = "swagger";
        c.DocumentTitle = "ConsultCore31 API Documentation";
        c.DefaultModelsExpandDepth(-1); // Oculta los esquemas de modelos
        c.DisplayRequestDuration();
        c.EnableDeepLinking();
        c.EnableFilter();
        c.ShowExtensions();
        c.EnableValidator();
    });

    // Configuración de Scalar UI - Versión básica
    app.MapScalarApiReference(options =>
    {
        // Título de la documentación
        options.Title = "ConsultCore31 API Documentation";

        // Ruta del documento OpenAPI (coincide con la configuración de Swagger)
        options.WithOpenApiRoutePattern("/openapi/{documentName}.json");

        // Prefijo personalizado para la ruta de la documentación
        // Debe incluir el marcador de posición {documentName}
        options.WithEndpointPrefix("/api-docs/{documentName}");

        // Mostrar la barra lateral
        options.ShowSidebar = true;

        // Habilitar modo oscuro
        options.DarkMode = true;

        // Configuración del tema (comentado hasta que se resuelva el tipo correcto)
        // options.Theme = ScalarTheme.BluePlanet;
    });

    // Configuración de Swagger UI (opcional, solo para desarrollo)
    if (app.Environment.IsDevelopment())
    {
        app.UseSwaggerUI(c =>
        {
            c.SwaggerEndpoint("/openapi/v1.json", "ConsultCore31 API V1");
            c.RoutePrefix = "swagger";
            c.DocumentTitle = "ConsultCore31 API (Swagger UI)";
        });
    }

    // Aplicar migraciones automáticamente (solo para desarrollo)
    using (var scope = app.Services.CreateScope())
    {
        var services = scope.ServiceProvider;
        try
        {
            var context = services.GetRequiredService<AppDbContext>();
            if (context.Database.IsSqlServer())
            {
                await context.Database.MigrateAsync();
            }
        }
        catch (Exception ex)
        {
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
            logger.LogError(ex, "An error occurred while migrating or initializing the database.");
        }
    }
}

// Inicialización de la base de datos
await InitializeDatabase(app);

app.Run();

// Método para inicializar la base de datos
static async Task InitializeDatabase(WebApplication app)
{
    using var scope = app.Services.CreateScope();
    var services = scope.ServiceProvider;

    try
    {
        var context = services.GetRequiredService<AppDbContext>();
        await context.Database.MigrateAsync();

        // Aquí puedes agregar la inicialización de datos si es necesario
        // await DbInitializer.Initialize(context, services);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Ocurrió un error al inicializar la base de datos");
    }
}