---
name: dotnet-jwt-authentication
description: "Configures JWT Bearer authentication for .NET APIs. Includes token generation, validation, refresh tokens, and user context extraction from claims."
version: 1.1.0
language: C#
framework: .NET 8+
dependencies: Microsoft.AspNetCore.Authentication.JwtBearer, System.IdentityModel.Tokens.Jwt
---

# JWT Authentication Setup

## Overview

This skill implements JWT (JSON Web Token) authentication for .NET APIs:

- **Access Token** - Short-lived JWT returned in response body
- **Refresh Token** - Stored in HttpOnly cookie
- **Options Pattern** - Configurable expiration via JwtOptions
- **Token Rotation** - New refresh token issued on each refresh

## Quick Reference

| Component | Purpose | Location |
|-----------|---------|----------|
| `IJwtService` | Token generation interface | Application/Abstractions |
| `JwtService` | Token generation implementation | Infrastructure/Authentication |
| `JwtOptions` | Configuration | Infrastructure/Authentication |
| `IUserContext` | Current user info | Application/Abstractions |

---

## Template: JWT Configuration Options

```csharp
// src/{name}.infrastructure/Authentication/JwtOptions.cs
namespace {name}.infrastructure.authentication;

public sealed class JwtOptions
{
    public const string SectionName = "Jwt";
    public string Issuer { get; init; } = string.Empty;
    public string Audience { get; init; } = string.Empty;
    public string SecretKey { get; init; } = string.Empty;
    public int AccessTokenExpirationMinutes { get; init; } = 60;
    public int RefreshTokenExpirationDays { get; init; } = 7;
}
```

### appsettings.json

```json
{
  "Jwt": {
    "Issuer": "your-app-name",
    "Audience": "your-app-name",
    "SecretKey": "your-secret-key-at-least-32-characters-long",
    "AccessTokenExpirationMinutes": 60,
    "RefreshTokenExpirationDays": 7
  }
}
```

---

## Template: JWT Service

```csharp
// src/{name}.application/Abstractions/Authentication/IJwtService.cs
namespace {name}.application.abstractions.authentication;

public interface IJwtService
{
    string GenerateAccessToken(Guid userId, string email, IEnumerable<string> roles);
    string GenerateRefreshToken();
    bool VerifyRefreshToken(string token, string hash);
}
```

```csharp
// src/{name}.infrastructure/Authentication/JwtService.cs
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace {name}.infrastructure.authentication;

internal sealed class JwtService : IJwtService
{
    private readonly JwtOptions _options;

    public JwtService(IOptions<JwtOptions> options)
    {
        _options = options.Value;
    }

    public string GenerateAccessToken(Guid userId, string email, IEnumerable<string> roles)
    {
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_options.SecretKey));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new(JwtRegisteredClaimNames.Email, email),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        foreach (var role in roles)
            claims.Add(new Claim(ClaimTypes.Role, role));

        var token = new JwtSecurityToken(
            issuer: _options.Issuer,
            audience: _options.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_options.AccessTokenExpirationMinutes),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string GenerateRefreshToken()
    {
        return Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
    }

    public bool VerifyRefreshToken(string token, string hash)
    {
        return hash == Convert.ToBase64String(SHA256.HashData(Encoding.UTF8.GetBytes(token)));
    }
}
```

---

## Template: User Context

```csharp
// src/{name}.application/Abstractions/Authentication/IUserContext.cs
namespace {name}.application.abstractions.authentication;

public interface IUserContext
{
    Guid UserId { get; }
    string Email { get; }
    bool IsAuthenticated { get; }
    bool IsInRole(string role);
}
```

```csharp
// src/{name}.infrastructure/Authentication/UserContext.cs
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace {name}.infrastructure.authentication;

internal sealed class UserContext : IUserContext
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public UserContext(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    private ClaimsPrincipal? User => _httpContextAccessor.HttpContext?.User;

    public bool IsAuthenticated => User?.Identity?.IsAuthenticated ?? false;

    public Guid UserId
    {
        get
        {
            var claim = User?.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
                ?? User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.TryParse(claim, out var id) ? id : throw new InvalidOperationException();
        }
    }

    public string Email => User?.FindFirst(JwtRegisteredClaimNames.Email)?.Value ?? string.Empty;

    public bool IsInRole(string role) => User?.IsInRole(role) ?? false;
}
```

---

## Template: JWT Bearer Setup

```csharp
// src/{name}.infrastructure/Authentication/JwtBearerOptionsSetup.cs
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace {name}.infrastructure.authentication;

internal sealed class JwtBearerOptionsSetup : IConfigureNamedOptions<JwtBearerOptions>
{
    private readonly JwtOptions _options;

    public JwtBearerOptionsSetup(IOptions<JwtOptions> options)
    {
        _options = options.Value;
    }

    public void Configure(string? name, JwtBearerOptions options)
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = _options.Issuer,
            ValidateAudience = true,
            ValidAudience = _options.Audience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_options.SecretKey)),
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    }

    public void Configure(JwtBearerOptions options) => Configure(null, options);
}
```

---

## Template: Authentication Registration

```csharp
// src/{name}.infrastructure/Authentication/AuthenticationExtensions.cs
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace {name}.infrastructure.authentication;

public static class AuthenticationExtensions
{
    public static IServiceCollection AddJwtAuthentication(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<JwtOptions>(configuration.GetSection(JwtOptions.SectionName));

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer();

        services.ConfigureOptions<JwtBearerOptionsSetup>();

        services.AddHttpContextAccessor();
        services.AddScoped<IJwtService, JwtService>();
        services.AddScoped<IUserContext, UserContext>();

        return services;
    }
}
```

---

## Critical Rules

1. **Secret key length** - At least 32 characters for HMAC-SHA256
2. **Short access tokens** - 15-60 minutes typical
3. **Validate all claims** - Issuer, audience, signature, expiration
4. **No clock skew** - Set `ClockSkew = TimeSpan.Zero`
5. **Use IUserContext** - Don't access HttpContext directly in handlers

---

## Related Skills

- `dotnet-permission-authorization` - Permission-based access control
- `dotnet-clean-architecture` - Infrastructure layer setup