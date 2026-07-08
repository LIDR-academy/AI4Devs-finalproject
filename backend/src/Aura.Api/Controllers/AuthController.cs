using System.Security.Claims;
using System.Security.Cryptography;
using Aura.Core.DTOs.Auth;
using Aura.Core.Enums;
using Aura.Core.Interfaces.Repositories;
using Aura.Core.Interfaces.Services;
using Aura.Core.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Aura.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IUserRepository _userRepository;
    private readonly IUserConsentRepository _userConsentRepository;
    private readonly IConfiguration _configuration;

    public AuthController(
        IAuthService authService,
        IUserRepository userRepository,
        IUserConsentRepository userConsentRepository,
        IConfiguration configuration)
    {
        _authService = authService;
        _userRepository = userRepository;
        _userConsentRepository = userConsentRepository;
        _configuration = configuration;
    }

    [HttpPost("magic-link")]
    public async Task<IActionResult> RequestMagicLink([FromBody] MagicLinkRequest request)
    {
        var baseUrl = _configuration["MagicLink:BaseUrl"] ?? "http://localhost:4200";
        var magicLinkUrlTemplate = $"{baseUrl}/verify?token={{token}}";
        await _authService.RequestMagicLinkAsync(request.Email, magicLinkUrlTemplate);
        
        return Ok(new { Message = "Magic link sent. Check your email." });
    }

    [HttpPost("verify")]
    public async Task<IActionResult> VerifyMagicLink([FromBody] VerifyRequest request)
    {
        try
        {
            var (user, jwtToken) = await _authService.VerifyMagicLinkAsync(request.Token);

            SetAuthCookies(jwtToken);

            return Ok(new VerifyResponse
            {
                User = user,
                IsFirstLogin = user.Name == user.Email.Split('@')[0]
            });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { Message = ex.Message });
        }
    }

    [HttpPost("profile")]
    [Authorize]
    public async Task<IActionResult> ProfileSetup([FromBody] ProfileSetupRequest request)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdString, out var userId))
            return Unauthorized();

        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null) return NotFound();

        user.Name = request.Name;
        if (!string.IsNullOrEmpty(request.Timezone)) user.Timezone = request.Timezone;
        if (!string.IsNullOrEmpty(request.Locale)) user.Locale = request.Locale;

        if (request.AcceptsTerms)
        {
            await _userConsentRepository.AddAsync(new UserConsent
            {
                UserId = user.Id,
                ConsentType = ConsentType.Terms,
                IsAccepted = true,
                TermsVersion = "1.0"
            });
        }

        if (request.AcceptsDataProcessing)
        {
            await _userConsentRepository.AddAsync(new UserConsent
            {
                UserId = user.Id,
                ConsentType = ConsentType.DataProcessing,
                IsAccepted = true,
                TermsVersion = "1.0"
            });
        }

        await _userRepository.UpdateAsync(user);

        return Ok();
    }

    [HttpPost("refresh")]
    [Authorize]
    public async Task<IActionResult> Refresh()
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdString, out var userId))
            return Unauthorized();

        try
        {
            var newJwtToken = await _authService.RefreshTokenAsync(userId);
            SetAuthCookies(newJwtToken);

            return Ok(new { Refreshed = true });
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized();
        }
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        var token = Request.Cookies["aura_session"];
        if (!string.IsNullOrEmpty(token))
        {
            await _authService.LogoutAsync(token);
        }

        Response.Cookies.Delete("aura_session");
        Response.Cookies.Delete("aura_csrf");

        return Ok(new { LoggedOut = true });
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetMe()
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdString, out var userId))
            return Unauthorized();

        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null) return NotFound();

        return Ok(new
        {
            user.Id,
            user.Email,
            user.Name,
            Role = User.FindFirstValue(ClaimTypes.Role),
            user.Status,
            IsFirstLogin = user.Name == user.Email.Split('@')[0]
        });
    }

    private void SetAuthCookies(string jwtToken)
    {
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = !Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT")!.Equals("Development", StringComparison.OrdinalIgnoreCase),
            SameSite = SameSiteMode.Strict,
            Path = "/",
            Expires = DateTimeOffset.UtcNow.AddHours(24)
        };
        Response.Cookies.Append("aura_session", jwtToken, cookieOptions);

        var csrfBytes = new byte[32];
        RandomNumberGenerator.Fill(csrfBytes);
        var csrfToken = Convert.ToBase64String(csrfBytes);

        var csrfCookieOptions = new CookieOptions
        {
            HttpOnly = false,
            Secure = cookieOptions.Secure,
            SameSite = SameSiteMode.Strict,
            Path = "/",
            Expires = cookieOptions.Expires
        };
        Response.Cookies.Append("aura_csrf", csrfToken, csrfCookieOptions);
    }
}
