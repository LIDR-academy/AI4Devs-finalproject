using System.Text;
using System.Threading.RateLimiting;
using FluentValidation;
using InkLink.Api.Application.Validators;
using InkLink.Api.Domain.Services;
using InkLink.Api.Infrastructure.Data;
using InkLink.Api.Infrastructure.External;
using InkLink.Api.Infrastructure.Security;
using InkLink.Api.Seed;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Npgsql;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' is not configured");
var dataSource = new NpgsqlDataSourceBuilder(connectionString)
    .EnableDynamicJson()
    .Build();
builder.Services.AddDbContext<InkLinkDbContext>(options =>
    options.UseNpgsql(dataSource).UseSnakeCaseNamingConvention());

builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection(JwtSettings.SectionName));
builder.Services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ShowcaseService>();
builder.Services.AddScoped<ArtistQueryService>();
builder.Services.AddScoped<GeoService>();
builder.Services.AddScoped<AvailabilityService>();
builder.Services.AddScoped<QuoteCalculatorService>();
builder.Services.AddScoped<BookingService>();
builder.Services.AddScoped<ReviewService>();

// US0009 — Flow payments (mock-first until sandbox credentials are available)
var flowSettings = builder.Configuration.GetSection(FlowSettings.SectionName).Get<FlowSettings>() ?? new FlowSettings();
builder.Services.AddSingleton(flowSettings);
if (flowSettings.UseMock)
{
    builder.Services.AddSingleton<IFlowClient, MockFlowClient>();
}
else
{
    builder.Services.AddHttpClient<IFlowClient, FlowClient>();
}
builder.Services.AddScoped<PaymentService>();
builder.Services.AddScoped<DatabaseSeeder>();
builder.Services.AddValidatorsFromAssemblyContaining<LoginRequestValidator>();

var jwtSettings = builder.Configuration.GetSection(JwtSettings.SectionName).Get<JwtSettings>()
    ?? new JwtSettings();
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtSettings.Issuer,
            ValidateAudience = true,
            ValidAudience = jwtSettings.Audience,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtSettings.Secret.PadRight(32, '_'))),
            ClockSkew = TimeSpan.FromMinutes(1)
        };
    });
builder.Services.AddAuthorization();

// Basic brute-force protection on the login endpoint (US0001 TASK0002 DoD)
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy("login", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 5,
                Window = TimeSpan.FromMinutes(1)
            }));
});

const string FrontendCorsPolicy = "Frontend";
builder.Services.AddCors(options =>
{
    options.AddPolicy(FrontendCorsPolicy, policy =>
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

if (args.Contains("--seed"))
{
    using var scope = app.Services.CreateScope();
    var context = scope.ServiceProvider.GetRequiredService<InkLinkDbContext>();
    await context.Database.MigrateAsync();
    var seeder = scope.ServiceProvider.GetRequiredService<DatabaseSeeder>();
    await seeder.SeedAsync();
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors(FrontendCorsPolicy);
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();

// Exposed for integration tests (WebApplicationFactory)
public partial class Program { }
