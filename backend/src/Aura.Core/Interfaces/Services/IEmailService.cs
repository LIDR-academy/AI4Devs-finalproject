namespace Aura.Core.Interfaces.Services;

public interface IEmailService
{
    Task SendMagicLinkAsync(string email, string magicLinkUrl);
}
