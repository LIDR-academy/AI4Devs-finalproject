using InkLink.Api.Application.Dtos;
using InkLink.Api.Domain.Entities;
using InkLink.Api.Domain.Enums;
using InkLink.Api.Infrastructure.Data;
using InkLink.Api.Infrastructure.External;
using Microsoft.EntityFrameworkCore;

namespace InkLink.Api.Domain.Services;

public enum PaymentCreateOutcome
{
    Created,
    BookingNotFound,
    NotOwner,
    NotPayable
}

public record PaymentCreateResult(PaymentCreateOutcome Outcome, PaymentCreateResponse? Response = null);

/// <summary>
/// US0009 — Deposit payment via Flow: order creation, confirmation webhook and return redirect.
/// Payment rejection keeps the Payment in pending (the model has no failed status); the client can
/// retry while the hold is alive, and the hold TTL releases the slot if the payment is abandoned (CA6).
/// </summary>
public class PaymentService
{
    private readonly InkLinkDbContext _context;
    private readonly IFlowClient _flowClient;
    private readonly FlowSettings _flowSettings;
    private readonly decimal _commissionRate;
    private readonly ILogger<PaymentService> _logger;

    public PaymentService(
        InkLinkDbContext context,
        IFlowClient flowClient,
        FlowSettings flowSettings,
        IConfiguration configuration,
        ILogger<PaymentService> logger)
    {
        _context = context;
        _flowClient = flowClient;
        _flowSettings = flowSettings;
        _commissionRate = configuration.GetValue<decimal>("Platform:CommissionRate", 0.07m);
        _logger = logger;
    }

    public async Task<PaymentCreateResult> CreateAsync(
        Guid clientId, Guid bookingId, CancellationToken cancellationToken = default)
    {
        var booking = await _context.Bookings
            .Include(b => b.Client)
            .Include(b => b.ArtistProfile).ThenInclude(p => p.User)
            .Include(b => b.Payment)
            .SingleOrDefaultAsync(b => b.Id == bookingId, cancellationToken);
        if (booking is null)
        {
            return new PaymentCreateResult(PaymentCreateOutcome.BookingNotFound);
        }
        if (booking.ClientId != clientId)
        {
            return new PaymentCreateResult(PaymentCreateOutcome.NotOwner);
        }
        if (booking.Status != BookingStatus.PendingPayment || booking.ExpiresAt <= DateTime.UtcNow)
        {
            return new PaymentCreateResult(PaymentCreateOutcome.NotPayable);
        }

        // Retry (CA5) reuses the pending Payment row; a new Flow order is created each time.
        var payment = booking.Payment;
        if (payment is null)
        {
            var platformFee = (int)Math.Round(booking.DepositAmount * _commissionRate, MidpointRounding.AwayFromZero);
            payment = new Payment
            {
                Id = Guid.NewGuid(),
                BookingId = booking.Id,
                Amount = booking.DepositAmount,
                PlatformFee = platformFee,
                ArtistAmount = booking.DepositAmount - platformFee,
                Status = PaymentStatus.Pending
            };
            _context.Payments.Add(payment);
        }
        else if (payment.Status == PaymentStatus.Completed)
        {
            return new PaymentCreateResult(PaymentCreateOutcome.NotPayable);
        }

        var artistName = $"{booking.ArtistProfile.User.FirstName} {booking.ArtistProfile.User.LastName}";
        var order = await _flowClient.CreatePaymentOrderAsync(
            commerceOrder: payment.Id.ToString(),
            subject: $"INK·LINK — depósito de reserva con {artistName}",
            amount: payment.Amount,
            payerEmail: booking.Client.Email,
            returnUrl: $"{_flowSettings.ApiBaseUrl}/api/payments/return",
            confirmationUrl: $"{_flowSettings.ApiBaseUrl}/api/payments/confirm",
            cancellationToken);

        payment.FlowTransactionId = order.Token;
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Flow order created for payment {PaymentId} (booking {BookingId}, amount {Amount})",
            payment.Id, booking.Id, payment.Amount);

        return new PaymentCreateResult(
            PaymentCreateOutcome.Created,
            new PaymentCreateResponse(order.PaymentUrl, order.Token));
    }

    /// <summary>
    /// Flow confirmation webhook (CA3, CA7-CA9). Idempotent: an already-completed payment is
    /// acknowledged without side effects. The payment status is fetched from Flow with a signed
    /// request — that is what authenticates the webhook (the token alone grants nothing).
    /// </summary>
    public async Task ConfirmAsync(string token, CancellationToken cancellationToken = default)
    {
        var payment = await _context.Payments
            .Include(p => p.Booking)
            .SingleOrDefaultAsync(p => p.FlowTransactionId == token, cancellationToken);
        if (payment is null)
        {
            _logger.LogWarning("Flow webhook received for unknown token");
            return;
        }
        if (payment.Status == PaymentStatus.Completed)
        {
            return; // idempotent
        }

        var status = await _flowClient.GetPaymentStatusAsync(token, cancellationToken);
        if (status == FlowPaymentStatus.Paid)
        {
            payment.Status = PaymentStatus.Completed;
            payment.PaidAt = DateTime.UtcNow;
            payment.Booking.Status = BookingStatus.Confirmed;
            payment.Booking.ExpiresAt = null;
            await _context.SaveChangesAsync(cancellationToken);
            _logger.LogInformation(
                "Payment {PaymentId} completed; booking {BookingId} confirmed",
                payment.Id, payment.BookingId);
        }
        else
        {
            _logger.LogInformation(
                "Payment {PaymentId} not completed (Flow status {Status}); hold TTL will release the slot",
                payment.Id, status);
        }
    }

    /// <summary>Return redirect after the Flow checkout (CA4-CA6): sends the client back to the SPA.</summary>
    public async Task<string> ResolveReturnUrlAsync(string token, CancellationToken cancellationToken = default)
    {
        var payment = await _context.Payments
            .AsNoTracking()
            .SingleOrDefaultAsync(p => p.FlowTransactionId == token, cancellationToken);
        if (payment is null)
        {
            return _flowSettings.FrontendBaseUrl;
        }

        var status = payment.Status == PaymentStatus.Completed ? "success" : "failed";
        return $"{_flowSettings.FrontendBaseUrl}/reservas/{payment.BookingId}?status={status}";
    }
}
