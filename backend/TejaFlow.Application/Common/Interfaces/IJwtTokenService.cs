using TejaFlow.Application.Auth;
using TejaFlow.Domain.Entities;

namespace TejaFlow.Application.Common.Interfaces;

public interface IJwtTokenService
{
    AuthResult CreateToken(Usuario usuario);
}

