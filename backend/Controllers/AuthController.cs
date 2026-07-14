using FluentValidation;
using InkLink.Api.Application.Dtos;
using InkLink.Api.Domain.Services;
using InkLink.Api.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;

namespace InkLink.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IValidator<LoginRequest> _loginValidator;
    private readonly InkLinkDbContext _context;

    public AuthController(
        IAuthService authService,
        IValidator<LoginRequest> loginValidator,
        InkLinkDbContext context)
    {
        _authService = authService;
        _loginValidator = loginValidator;
        _context = context;
    }

    /// <summary>US0001 — Login with email and password. Returns JWT (24h).</summary>
    [HttpPost("login")]
    [EnableRateLimiting("login")]
    public async Task<IActionResult> Login(LoginRequest request, CancellationToken cancellationToken)
    {
        var validation = await _loginValidator.ValidateAsync(request, cancellationToken);
        if (!validation.IsValid)
        {
            return BadRequest(new { message = "Invalid request", code = "VALIDATION_ERROR" });
        }

        var response = await _authService.LoginAsync(request, cancellationToken);
        if (response is null)
        {
            // Generic message: never reveal whether the email exists (US0001 CA3)
            return Unauthorized(new { message = "Invalid credentials", code = "INVALID_CREDENTIALS" });
        }

        return Ok(response);
    }

    /// <summary>US0001 — Current authenticated user.</summary>
    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> Me(CancellationToken cancellationToken)
    {
        var userIdClaim = User.FindFirst("user_id")?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var user = await _context.Users
            .Include(u => u.ArtistProfile)
            .SingleOrDefaultAsync(u => u.Id == userId, cancellationToken);
        if (user is null)
        {
            return Unauthorized();
        }

        return Ok(new UserSummaryDto(
            user.Id,
            user.Email,
            user.FirstName,
            user.LastName,
            user.Role.ToString().ToLowerInvariant(),
            user.AvatarUrl,
            user.ArtistProfile?.Id));
    }
}
