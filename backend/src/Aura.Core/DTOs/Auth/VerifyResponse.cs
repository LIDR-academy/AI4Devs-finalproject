using Aura.Core.Models;

namespace Aura.Core.DTOs.Auth;

public class VerifyResponse
{
    public User User { get; set; } = null!;
    public bool IsFirstLogin { get; set; }
}
