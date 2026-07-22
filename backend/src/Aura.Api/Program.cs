using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Amazon;
using Amazon.Runtime;
using Amazon.S3;
using Aura.Api;
using Aura.Api.Filters;
using Aura.Api.Middleware;
using Aura.Infrastructure;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Scalar.AspNetCore;
using Serilog;
using Serilog.Formatting.Compact;
using StackExchange.Redis;

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console(new CompactJsonFormatter())
    .CreateBootstrapLogger();

try
{
    var builder = WebApplication.CreateBuilder(args);

    builder.Host.UseSerilog((context, services, configuration) => configuration
        .ReadFrom.Configuration(context.Configuration)
        .ReadFrom.Services(services)
        .Enrich.FromLogContext()
        .Enrich.WithProperty("Application", "Aura.Api")
        .WriteTo.Console(new CompactJsonFormatter())
        .MinimumLevel.Override("Microsoft.AspNetCore", Serilog.Events.LogEventLevel.Warning));

    builder.Services.AddControllers(options =>
    {
        options.Filters.Add<ValidationFilter>();
    }).AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });

    builder.Services.AddOpenApi(options =>
    {
        options.AddDocumentTransformer((document, context, ct) =>
        {
            document.Components ??= new OpenApiComponents();
            document.Components.SecuritySchemes["cookieAuth"] = new OpenApiSecurityScheme
            {
                Type = SecuritySchemeType.ApiKey,
                In = ParameterLocation.Cookie,
                Name = "aura_session",
                Description = "JWT session cookie"
            };
            document.Components.SecuritySchemes["csrfAuth"] = new OpenApiSecurityScheme
            {
                Type = SecuritySchemeType.ApiKey,
                In = ParameterLocation.Header,
                Name = "X-CSRF-Token",
                Description = "CSRF token from aura_csrf cookie"
            };
            document.SecurityRequirements.Add(new OpenApiSecurityRequirement
            {
                { new OpenApiSecurityScheme { Reference = new OpenApiReference { Id = "cookieAuth", Type = ReferenceType.SecurityScheme } }, [] },
                { new OpenApiSecurityScheme { Reference = new OpenApiReference { Id = "csrfAuth", Type = ReferenceType.SecurityScheme } }, [] }
            });
            return Task.CompletedTask;
        });
    });

    builder.Services.AddInfrastructure(builder.Configuration);

    var jwtKey = builder.Configuration["Jwt:Key"]!;
    var jwtIssuer = builder.Configuration["Jwt:Issuer"]!;
    var jwtAudience = builder.Configuration["Jwt:Audience"]!;

    builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = jwtIssuer,
                ValidAudience = jwtAudience,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
                ClockSkew = TimeSpan.Zero
            };

            options.Events = new JwtBearerEvents
            {
                OnMessageReceived = context =>
                {
                    var token = context.Request.Cookies["aura_session"];
                    if (!string.IsNullOrEmpty(token))
                    {
                        context.Token = token;
                    }
                    return Task.CompletedTask;
                },
                OnTokenValidated = async context =>
                {
                    var rawToken = context.Request.Cookies["aura_session"];
                    if (string.IsNullOrEmpty(rawToken))
                        return;

                    var tokenHash = Convert.ToBase64String(
                        SHA256.HashData(Encoding.UTF8.GetBytes(rawToken)));

                    var redis = context.HttpContext.RequestServices.GetRequiredService<IConnectionMultiplexer>();
                    var db = redis.GetDatabase();

                    if (await db.KeyExistsAsync($"auth:blacklist:{tokenHash}"))
                    {
                        context.Fail("Token has been revoked");
                    }
                }
            };
        });

    builder.Services.AddAuthorization(options =>
    {
        options.AddPolicy("EventOwner", policy =>
            policy.RequireAssertion(context =>
                context.User.FindFirstValue(ClaimTypes.Role) == "host"));

        options.AddPolicy("AccompliceScoped", policy =>
            policy.RequireAssertion(context =>
            {
                var role = context.User.FindFirstValue(ClaimTypes.Role);
                var eventId = context.User.FindFirstValue("eventId");
                return role == "accomplice" && !string.IsNullOrEmpty(eventId);
            }));

        options.AddPolicy("PublishedEvent", policy =>
            policy.RequireAssertion(_ => true));

        options.AddPolicy("DraftGuestLimit", policy =>
            policy.RequireAssertion(_ => true));

        options.AddPolicy("ActiveAccomplice", policy =>
            policy.RequireAssertion(context =>
                context.User.FindFirstValue(ClaimTypes.Role) == "accomplice"));
    });

    builder.Services.AddCors(options =>
    {
        options.AddPolicy("DefaultPolicy", policy =>
        {
            if (builder.Environment.IsDevelopment())
            {
                policy.WithOrigins("http://localhost:4200", "http://localhost:5173")
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
            }
            else
            {
                policy.WithOrigins("https://aura.planning")
                    .SetIsOriginAllowedToAllowWildcardSubdomains()
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
            }
        });
    });

    var dragonflyConnectionString = builder.Configuration["Dragonfly:ConnectionString"]!;
    builder.Services.AddSingleton<IConnectionMultiplexer>(_ =>
        ConnectionMultiplexer.Connect($"{dragonflyConnectionString},abortConnect=false"));

    builder.Services.AddStackExchangeRedisCache(options =>
    {
        options.Configuration = dragonflyConnectionString;
    });

    var minioEndpoint = builder.Configuration["Minio:Endpoint"]!;
    var minioAccessKey = builder.Configuration["Minio:AccessKey"]!;
    var minioSecretKey = builder.Configuration["Minio:SecretKey"]!;

    builder.Services.AddSingleton<IAmazonS3>(_ =>
    {
        var config = new AmazonS3Config
        {
            ServiceURL = $"http://{minioEndpoint}",
            ForcePathStyle = true
        };
        return new AmazonS3Client(
            new BasicAWSCredentials(minioAccessKey, minioSecretKey),
            config);
    });

    builder.Services.AddValidatorsFromAssemblyContaining<Program>();

    builder.Services.AddRateLimiter(options =>
    {
        options.AddFixedWindowLimiter("RsvpGetPolicy", opt =>
        {
            opt.PermitLimit = 60;
            opt.Window = TimeSpan.FromMinutes(1);
            opt.QueueProcessingOrder = System.Threading.RateLimiting.QueueProcessingOrder.OldestFirst;
            opt.QueueLimit = 0;
        });

        options.AddFixedWindowLimiter("RsvpSubmitPolicy", opt =>
        {
            opt.PermitLimit = 5;
            opt.Window = TimeSpan.FromHours(1);
            opt.QueueProcessingOrder = System.Threading.RateLimiting.QueueProcessingOrder.OldestFirst;
            opt.QueueLimit = 0;
        });
    });

    builder.Services.AddAuraHealthChecks(builder.Configuration);

    var app = builder.Build();

    if (app.Environment.IsDevelopment())
    {
        app.MapOpenApi();
        app.MapScalarApiReference();
    }

    app.UseMiddleware<ExceptionHandlingMiddleware>();
    
    if (!app.Environment.IsDevelopment())
    {
        app.UseMiddleware<SecurityHeadersMiddleware>();
    }
    
    app.UseMiddleware<RateLimitingMiddleware>();
    app.UseRateLimiter();
    app.UseCors("DefaultPolicy");
    app.UseMiddleware<CsrfValidationMiddleware>();
    app.UseAuthentication();
    app.UseAuthorization();

    app.MapControllers();

    app.MapGet("/", () => "OK").WithName("GetRoot");

    app.MapHealthChecks("/health/live", new HealthCheckOptions
    {
        Predicate = _ => false
    });

    app.MapHealthChecks("/health/ready", new HealthCheckOptions
    {
        Predicate = check => check.Tags.Contains("ready")
    });

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}

public partial class Program { }
