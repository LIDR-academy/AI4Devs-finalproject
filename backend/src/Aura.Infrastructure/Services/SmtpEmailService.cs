using System.Net;
using System.Net.Mail;
using Aura.Core.Interfaces.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Aura.Infrastructure.Services;

public class SmtpEmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<SmtpEmailService> _logger;

    public SmtpEmailService(IConfiguration configuration, ILogger<SmtpEmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SendMagicLinkAsync(string email, string magicLinkUrl)
    {
        var smtpServer = _configuration["Smtp:Host"] ?? "smtp.gmail.com";
        var smtpPort = int.Parse(_configuration["Smtp:Port"] ?? "587");
        var smtpUsername = _configuration["Smtp:Username"];
        var smtpPassword = _configuration["Smtp:Password"];
        var fromEmail = _configuration["Smtp:FromEmail"] ?? "noreply@aura.com";

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

        _logger.LogInformation("\n========================================\nMAGIC LINK FOR {Email}: {Url}\n========================================\n", email, magicLinkUrl);

        try
        {
            await client.SendMailAsync(mailMessage);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to send email to {Email}. If running locally without MailHog, copy the link above.", email);
        }
    }

    public async Task SendEmailAsync(string to, string subject, string htmlBody)
    {
        var smtpServer = _configuration["Smtp:Host"] ?? "smtp.gmail.com";
        var smtpPort = int.Parse(_configuration["Smtp:Port"] ?? "587");
        var smtpUsername = _configuration["Smtp:Username"];
        var smtpPassword = _configuration["Smtp:Password"];
        var fromEmail = _configuration["Smtp:FromEmail"] ?? "noreply@aura.com";

        using var client = new SmtpClient(smtpServer, smtpPort)
        {
            Credentials = new NetworkCredential(smtpUsername, smtpPassword),
            EnableSsl = true
        };

        var mailMessage = new MailMessage
        {
            From = new MailAddress(fromEmail),
            Subject = subject,
            Body = htmlBody,
            IsBodyHtml = true,
        };
        mailMessage.To.Add(to);

        await client.SendMailAsync(mailMessage);
    }
}
