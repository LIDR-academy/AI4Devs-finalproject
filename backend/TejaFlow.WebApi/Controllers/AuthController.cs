using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TejaFlow.Application.Auth;

namespace TejaFlow.WebApi.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController : ControllerBase
{
    private readonly AuthService _authService;

    public AuthController(AuthService authService)
    {
        _authService = authService;
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        var result = await _authService.LoginAsync(
            new LoginCommand(request.Email, request.Password),
            cancellationToken);

        if (result is null)
        {
            return Unauthorized(new { message = "Credenciales invalidas." });
        }

        return Ok(result);
    }
}

public sealed record LoginRequest(string Email, string Password);

