using Aura.Core.Enums;
using Aura.Core.Models;

namespace Aura.Core.Interfaces.Services;

public interface IPaymentService
{
    Task<string> CreatePaymentIntentAsync(Guid eventId, PaymentTier tier, CancellationToken cancellationToken = default);
    Task ProcessWebhookAsync(string json, string stripeSignature, CancellationToken cancellationToken = default);
}
