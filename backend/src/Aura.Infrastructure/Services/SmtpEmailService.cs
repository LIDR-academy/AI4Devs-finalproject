using System.Net;
using System.Net.Mail;
using Aura.Core.Interfaces.Services;
using Microsoft.Extensions.Configuration;

namespace Aura.Infrastructure.Services;

public class SmtpEmailService : IEmailService
{
    private readonly IConfiguration _configuration;

    public SmtpEmailService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task SendMagicLinkAsync(string email, string magicLinkUrl)
    {
        var smtpServer = _configuration["Email:SmtpServer"] ?? "smtp.gmail.com";
        var smtpPort = int.Parse(_configuration["Email:SmtpPort"] ?? "587");
        var smtpUsername = _configuration["Email:SmtpUsername"];
        var smtpPassword = _configuration["Email:SmtpPassword"];
        var fromEmail = _configuration["Email:FromEmail"] ?? "noreply@aura.com";

        using var client = new SmtpClient(smtpServer, smtpPort)
        {
            Credentials = new NetworkCredential(smtpUsername, smtpPassword),
            EnableSsl = true
        };

        var mailMessage = new MailMessage
        {
            From = new MailAddress(fromEmail),
            Subject = "Your Magic Link to log in to Aura",
            Body = $"Click the link to log in: {magicLinkUrl}",
            IsBodyHtml = true,
        };
        mailMessage.To.Add(email);

        await client.SendMailAsync(mailMessage);
    }
}
