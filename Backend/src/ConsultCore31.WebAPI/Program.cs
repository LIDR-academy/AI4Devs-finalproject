using Asp.Versioning;
using Asp.Versioning.ApiExplorer;

using ConsultCore31.Core.Entities;
using ConsultCore31.Infrastructure;
using ConsultCore31.Infrastructure.Extensions;
using ConsultCore31.Infrastructure.Persistence.Context;
using ConsultCore31.WebAPI.Configurations;
using ConsultCore31.WebAPI.Extensions;

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

using Polly;
using Polly.Extensions.Http;

using Scalar.AspNetCore;

using Serilog;
using Serilog.Events;
using Serilog.Sinks.SystemConsole.Themes;

using System.Reflection;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

// Configuración de Serilog
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Debug()
    .MinimumLevel.Override("Microsoft", LogEventLevel.Information)
    .MinimumLevel.Override("Microsoft.AspNetCore", LogEventLevel.Warning)
    .MinimumLevel.Override("Microsoft.EntityFrameworkCore", LogEventLevel.Warning)
    .Enrich.FromLogContext()
    .Enrich.WithProperty("ApplicationName", "ConsultCore31.WebAPI")
    .Enrich.WithProperty("Environment", Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production")
    .Enrich.WithMachineName()
    .Enrich.WithProcessId()
    .Enrich.WithThreadId()
    .WriteTo.Console(
        outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] [{ApplicationName}] {Message:lj}{NewLine}{Exception}",
        theme: AnsiConsoleTheme.Code)
    .WriteTo.File(
        path: Path.Combine("logs", "log-.txt"),
        rollingInterval: RollingInterval.Day,
        outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] [{ApplicationName}] [{CorrelationId}] {Message:lj}{NewLine}{Exception}")
    .CreateLogger();

try
{
    Log.Information("Iniciando la aplicación ConsultCore31.WebAPI");

    var builder = WebApplication.CreateBuilder(args);

    // Agregar Serilog como proveedor de logs
    builder.Host.UseSerilog();

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

                // Habilitar logging detallado de comandos SQL en desarrollo
                if (builder.Environment.IsDevelopment())
                {
                    options.EnableSensitiveDataLogging();
                    options.EnableDetailedErrors();
                }
            }));

    // Configuración de controladores y JSON
    builder.Services.AddControllers()
        .AddJsonOptions(options =>
        {
            options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
            options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
            options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
            options.JsonSerializerOptions.WriteIndented = true;
        });

    // Configuración de Identity
    builder.Services.AddIdentity<Usuario, IdentityRole<int>>(options =>
    {
        options.SignIn.RequireConfirmedAccount = true;
    })
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();

    // Configurar timeout para solicitudes HTTP
    double.TryParse(builder.Configuration["RequestTimeoutInMinutes"], out var requestTimeoutInMinutes);

    // Configurar cliente HTTP con políticas de reintento
    var httpClientBuilder = builder.Services.AddHttpClient("DefaultClient", client =>
    {
        client.Timeout = TimeSpan.FromMinutes(requestTimeoutInMinutes > 0 ? requestTimeoutInMinutes : 2);
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
        .AddPolicyHandler(retryPolicy)
        .AddPolicyHandler(circuitBreakerPolicy);

    // Configuración de las opciones de Identity
    builder.Services.Configure<IdentityOptions>(options =>
    {
        // Configuración de contraseña
        options.Password.RequireDigit = true;
        options.Password.RequireLowercase = true;
        options.Password.RequireUppercase = true;
        options.Password.RequireNonAlphanumeric = true;
        options.Password.RequiredLength = 8;
        options.Password.RequiredUniqueChars = 1;

        // Configuración de bloqueo
        options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
        options.Lockout.MaxFailedAccessAttempts = 5;
        options.Lockout.AllowedForNewUsers = true;
    });

    // Configuración de Swagger
    builder.Services.AddEndpointsApiExplorer();

    // Configurar la integración de Swagger con API Versioning
    builder.Services.ConfigureOptions<ConfigureSwaggerOptions>();

    builder.Services.AddSwaggerGen(c =>
    {
        // La configuración de SwaggerDoc ahora se maneja a través de ConfigureSwaggerOptions

        // Configuración de seguridad JWT en Swagger
        var securityScheme = new OpenApiSecurityScheme
        {
            Name = "Authorization",
            Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
            In = ParameterLocation.Header,
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",
            Reference = new OpenApiReference
            {
                Type = ReferenceType.SecurityScheme,
                Id = "Bearer"
            }
        };

        c.AddSecurityDefinition("Bearer", securityScheme);

        c.AddSecurityRequirement(new OpenApiSecurityRequirement
        {
            { securityScheme, Array.Empty<string>() }
        });

        // Incluir comentarios XML para mejorar la documentación
        var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
        var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
        c.IncludeXmlComments(xmlPath);
    });

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

    // Registrar todos los repositorios de la capa de infraestructura
    builder.Services.AddRepositories();

    // Registrar todos los servicios de la aplicación de forma centralizada
    builder.Services.AddApplicationServices();

    // Configuración de caché distribuido (puede ser Redis, SQL Server, etc.)
    builder.Services.AddDistributedMemoryCache();

    // Configuración simplificada de DataProtection para persistir y cifrar claves
    var dataProtectionKeysPath = Path.Combine(AppContext.BaseDirectory, "DataProtection-Keys");
    if (!Directory.Exists(dataProtectionKeysPath))
    {
        Directory.CreateDirectory(dataProtectionKeysPath);
    }

    // Configuración básica de DataProtection compatible con .NET Core
    builder.Services.AddDataProtection()
        .PersistKeysToFileSystem(new DirectoryInfo(dataProtectionKeysPath))
        .SetApplicationName("ConsultCore31")
        .SetDefaultKeyLifetime(TimeSpan.FromDays(90));

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

    // La configuración de AutoMapper se realiza dentro de AddApplicationServices()

    // Configuración de la versión de la API
    builder.Services.AddApiVersioning(options =>
    {
        options.DefaultApiVersion = new ApiVersion(1, 0);
        options.AssumeDefaultVersionWhenUnspecified = true;
        options.ReportApiVersions = true;
    })
    .AddApiExplorer(options =>
    {
        // Formato de la versión en la URL
        options.GroupNameFormat = "'v'VVV";

        // Asume la versión por defecto cuando no se especifica
        options.SubstituteApiVersionInUrl = true;
    });

    // Configurar el prefijo de ruta base
    builder.WebHost.ConfigureKestrel(serverOptions =>
    {
        serverOptions.AddServerHeader = false;
    })
    .ConfigureAppConfiguration((context, config) =>
    {
        config.AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
              .AddJsonFile($"appsettings.{context.HostingEnvironment.EnvironmentName}.json", optional: true, reloadOnChange: true);
    })
    .ConfigureServices(services =>
    {
        services.Configure<ForwardedHeadersOptions>(options =>
        {
            options.ForwardedHeaders = Microsoft.AspNetCore.HttpOverrides.ForwardedHeaders.XForwardedFor |
                                      Microsoft.AspNetCore.HttpOverrides.ForwardedHeaders.XForwardedProto;
        });
    });

    var app = builder.Build();

    // Configuración del pipeline de solicitudes HTTP
    if (app.Environment.IsDevelopment())
    {
        app.UseDeveloperExceptionPage();
    }

    // Configurar el manejo de encabezados HTTP
    app.UseForwardedHeaders();

    // Inicialización de la base de datos
    using (var scope = app.Services.CreateScope())
    {
        var services = scope.ServiceProvider;
        try
        {
            var context = services.GetRequiredService<AppDbContext>();
            var logger = services.GetRequiredService<ILogger<Program>>();

            // Solo aplicar migraciones automáticamente en entorno de desarrollo
            if (app.Environment.IsDevelopment())
            {
                logger.LogInformation("Aplicando migraciones en entorno de desarrollo");
                await context.Database.MigrateAsync();

                // Aquí puedes agregar la inicialización de datos si es necesario
                // await DbInitializer.Initialize(context, services);
            }
            else
            {
                // En producción, solo verificar la conexión
                logger.LogInformation("Verificando conexión a la base de datos en entorno de producción");
                await context.Database.CanConnectAsync();
            }

            logger.LogInformation("Conexión a la base de datos establecida correctamente");
        }
        catch (Exception ex)
        {
            var logger = services.GetRequiredService<ILogger<Program>>();
            logger.LogError(ex, "Ocurrió un error al inicializar la base de datos");
        }
    }

    // Configuración de la canalización de middleware
    //app.UseHttpsRedirection();
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

    // Middleware personalizado para logging y diagnóstico
    // NOTA: Comentado temporalmente para resolver errores de compilación en CI/CD
    // app.UseExceptionLogging();

    // Configurar Swagger para que use el path base
    app.UseSwagger(c =>
    {
        c.PreSerializeFilters.Add((swaggerDoc, httpReq) =>
        {
            //// Configurar el servidor con la URL base correcta
            //var serverUrl = string.IsNullOrEmpty(pathBase)
            //    ? $"{httpReq.Scheme}://{httpReq.Host.Value}"
            //    : $"{httpReq.Scheme}://{httpReq.Host.Value}{pathBase}";

            //swaggerDoc.Servers = new List<OpenApiServer>
            //{
            //    new OpenApiServer { Url = serverUrl }
            //};
        });
    });

    string swaggerJsonUrl = string.Empty;

    // Configuración de Swagger UI
    app.UseSwaggerUI(options =>
    {
        // Obtener todas las descripciones de versiones de API disponibles
        var apiVersionDescriptionProvider = app.Services.GetRequiredService<IApiVersionDescriptionProvider>();

        // Crear un endpoint de Swagger para cada versión de API
        foreach (var description in apiVersionDescriptionProvider.ApiVersionDescriptions)
        {
            // Configurar el endpoint de Swagger para esta versión de la API
            //            swaggerJsonUrl = string.IsNullOrEmpty(pathBase)
            //                ? $"/swagger/{description.GroupName}/swagger.json"
            //                : $"{pathBase}/swagger/{description.GroupName}/swagger.json";
            swaggerJsonUrl = $"/swagger/{description.GroupName}/swagger.json";
            options.SwaggerEndpoint(swaggerJsonUrl, $"ConsultCore31 API {description.GroupName.ToUpperInvariant()}");
        }

        // Configuración adicional
        options.RoutePrefix = "swagger";
        options.DocumentTitle = "ConsultCore31 API Documentation";
        options.DefaultModelsExpandDepth(-1); // Oculta los esquemas de modelos
        options.DisplayRequestDuration();
        options.EnableDeepLinking();
        options.EnableFilter();
        options.ShowExtensions();
        options.EnableValidator();

        // Configuración de OAuth
        options.OAuthClientId("swagger-ui");
        options.OAuthClientSecret("swagger-ui-secret");
        options.OAuthUsePkce();
    });

    // Configuración de Scalar UI
    app.MapScalarApiReference(options =>
    {
        // Ruta del documento OpenAPI (coincide con la configuración de Swagger)
        options.WithOpenApiRoutePattern(swaggerJsonUrl);

        options
        .WithTitle("ConsultCore3:1 API")
        .WithTheme(ScalarTheme.Moon)
        .WithDefaultHttpClient(ScalarTarget.CSharp, ScalarClient.RestSharp);
    });

    // Redirección de la ruta raíz a Swagger
    //app.MapGet("/", () => Results.Redirect("/swagger")).ExcludeFromDescription();
    app.MapControllers();
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "La aplicación ConsultCore31.WebAPI se detuvo inesperadamente");
}
finally
{
    Log.CloseAndFlush();
}