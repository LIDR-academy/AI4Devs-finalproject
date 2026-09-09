using Microsoft.EntityFrameworkCore;
using TejaFlow.Application.Common.Interfaces;

namespace TejaFlow.Application.Auth;

public sealed class AuthService
{
    private readonly ITejaFlowDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenService _jwtTokenService;

    public AuthService(
        ITejaFlowDbContext context,
        IPasswordHasher passwordHasher,
        IJwtTokenService jwtTokenService)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _jwtTokenService = jwtTokenService;
    }

    public async Task<AuthResult?> LoginAsync(LoginCommand command, CancellationToken cancellationToken = default)
    {
        var email = command.Email.Trim().ToLowerInvariant();

        var usuario = await _context.Usuarios
            .AsNoTracking()
            .FirstOrDefaultAsync(user => user.Email.ToLower() == email && user.Activo, cancellationToken);

        if (usuario is null || !_passwordHasher.Verify(command.Password, usuario.PasswordHash))
        {
            return null;
        }

        return _jwtTokenService.CreateToken(usuario);
    }
}

