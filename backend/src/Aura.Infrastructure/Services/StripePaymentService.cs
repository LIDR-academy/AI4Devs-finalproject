using Aura.Core.Configuration;
using Aura.Core.Enums;
using Aura.Core.Exceptions;
using Aura.Core.Interfaces.Repositories;
using Aura.Core.Interfaces.Services;
using Aura.Core.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Stripe;
using System.Text.Json;

namespace Aura.Infrastructure.Services;

public class StripePaymentService : IPaymentService
{
    private readonly IPaymentRepository _paymentRepository;
    private readonly IEventRepository _eventRepository;
    private readonly IQueueService _queueService;
    private readonly StripeOptions _options;
    private readonly ILogger<StripePaymentService> _logger;

    public StripePaymentService(
        IPaymentRepository paymentRepository,
        IEventRepository eventRepository,
        IQueueService queueService,
        IOptions<StripeOptions> options,
        ILogger<StripePaymentService> logger)
    {
        _paymentRepository = paymentRepository;
        _eventRepository = eventRepository;
        _queueService = queueService;
        _options = options.Value;
        _logger = logger;
        
        StripeConfiguration.ApiKey = _options.SecretKey;
    }

    public async Task<string> CreatePaymentIntentAsync(Guid eventId, PaymentTier tier, CancellationToken cancellationToken = default)
    {
        var ev = await _eventRepository.GetByIdAsync(eventId, cancellationToken);
        if (ev == null)
        {
            throw new NotFoundException($"Event with ID {eventId} not found.");
        }

        if (ev.Status != EventStatus.Draft)
        {
            throw new DomainValidationException("Only draft events can be published.");
        }

        long amountInCents = tier == PaymentTier.Premium ? 2900 : 1900;
        
        var options = new PaymentIntentCreateOptions
        {
            Amount = amountInCents,
            Currency = "eur",
            Metadata = new Dictionary<string, string>
            {
                { "EventId", eventId.ToString() },
                { "Tier", tier.ToString() }
            }
        };

        var service = new PaymentIntentService();
        var paymentIntent = await service.CreateAsync(options, cancellationToken: cancellationToken);

        var payment = new Payment
        {
            EventId = eventId,
            StripePaymentIntentId = paymentIntent.Id,
            Amount = amountInCents / 100m,
            Currency = "EUR",
            Status = PaymentStatus.Pending,
            Tier = tier
        };

        await _paymentRepository.AddAsync(payment, cancellationToken);

        return paymentIntent.ClientSecret;
    }

    public async Task ProcessWebhookAsync(string json, string stripeSignature, CancellationToken cancellationToken = default)
    {
        Stripe.Event stripeEvent;
        try
        {
            stripeEvent = EventUtility.ConstructEvent(json, stripeSignature, _options.WebhookSecret);
        }
        catch (StripeException e)
        {
            _logger.LogError(e, "Failed to construct Stripe event.");
            throw new DomainValidationException("Invalid Stripe signature.");
        }

        _logger.LogInformation("Processing Stripe Webhook: {Type}", stripeEvent.Type);

        if (stripeEvent.Type == "payment_intent.succeeded")
        {
            var paymentIntent = stripeEvent.Data.Object as PaymentIntent;
            if (paymentIntent != null)
            {
                await HandlePaymentSucceededAsync(paymentIntent, cancellationToken);
            }
        }
        else if (stripeEvent.Type == "payment_intent.payment_failed")
        {
            var paymentIntent = stripeEvent.Data.Object as PaymentIntent;
            if (paymentIntent != null)
            {
                await HandlePaymentFailedAsync(paymentIntent, cancellationToken);
            }
        }
    }

    private async Task HandlePaymentSucceededAsync(PaymentIntent paymentIntent, CancellationToken cancellationToken)
    {
        var payment = await _paymentRepository.GetByStripePaymentIntentIdAsync(paymentIntent.Id, cancellationToken);
        if (payment == null)
        {
            _logger.LogWarning("Payment not found for PaymentIntent {Id}", paymentIntent.Id);
            return;
        }

        // Idempotency check
        if (payment.Status == PaymentStatus.Succeeded)
        {
            _logger.LogInformation("Payment {PaymentId} already succeeded. Skipping.", payment.Id);
            return;
        }

        payment.Status = PaymentStatus.Succeeded;
        payment.CompletedAt = DateTimeOffset.UtcNow;
        await _paymentRepository.UpdateAsync(payment, cancellationToken);

        // Transition event to Published
        var ev = await _eventRepository.GetByIdAsync(payment.EventId, cancellationToken);
        if (ev != null && ev.Status == EventStatus.Draft)
        {
            ev.Status = EventStatus.Published;
            ev.PublishedAt = DateTimeOffset.UtcNow;
            await _eventRepository.UpdateAsync(ev, cancellationToken);

            // Trigger SSG job
            await _queueService.EnqueueAsync("ssg:queue", JsonSerializer.Serialize(new { EventId = ev.Id }), cancellationToken);
            _logger.LogInformation("Event {EventId} published and SSG job enqueued.", ev.Id);
        }
    }

    private async Task HandlePaymentFailedAsync(PaymentIntent paymentIntent, CancellationToken cancellationToken)
    {
        var payment = await _paymentRepository.GetByStripePaymentIntentIdAsync(paymentIntent.Id, cancellationToken);
        if (payment == null)
        {
            _logger.LogWarning("Payment not found for PaymentIntent {Id}", paymentIntent.Id);
            return;
        }

        if (payment.Status == PaymentStatus.Succeeded)
        {
            _logger.LogWarning("Payment {PaymentId} succeeded previously, but a failed event arrived.", payment.Id);
            return;
        }

        payment.Status = PaymentStatus.Failed;
        await _paymentRepository.UpdateAsync(payment, cancellationToken);
        _logger.LogInformation("Payment {PaymentId} marked as failed.", payment.Id);
    }
}
