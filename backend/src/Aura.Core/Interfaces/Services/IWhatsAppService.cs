using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Aura.Core.Interfaces.Services;

public interface IWhatsAppService
{
    Task<string> SendTemplateMessageAsync(string to, string templateName, IDictionary<string, string> variables, CancellationToken cancellationToken = default);
    Task<string> SendTextMessageAsync(string to, string message, CancellationToken cancellationToken = default);
    Task<string> GetDeliveryStatusAsync(string messageId, CancellationToken cancellationToken = default);
}
