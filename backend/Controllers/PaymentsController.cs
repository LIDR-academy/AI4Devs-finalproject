using InkLink.Api.Application.Dtos;
using InkLink.Api.Domain.Services;
using InkLink.Api.Infrastructure.External;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InkLink.Api.Controllers;

[ApiController]
[Route("api/payments")]
public class PaymentsController : ControllerBase
{
    private readonly PaymentService _paymentService;
    private readonly FlowSettings _flowSettings;

    public PaymentsController(PaymentService paymentService, FlowSettings flowSettings)
    {
        _paymentService = paymentService;
        _flowSettings = flowSettings;
    }

    /// <summary>US0009 CA1-CA2 — Creates the Flow order for the booking deposit and returns the redirect URL.</summary>
    [HttpPost("create")]
    [Authorize]
    public async Task<IActionResult> Create(PaymentCreateRequest request, CancellationToken cancellationToken)
    {
        var userIdClaim = User.FindFirst("user_id")?.Value;
        if (!Guid.TryParse(userIdClaim, out var clientId))
        {
            return Unauthorized();
        }

        var result = await _paymentService.CreateAsync(clientId, request.BookingId, cancellationToken);
        return result.Outcome switch
        {
            PaymentCreateOutcome.Created => Ok(result.Response),
            PaymentCreateOutcome.BookingNotFound => NotFound(new { message = "Booking not found", code = "BOOKING_NOT_FOUND" }),
            PaymentCreateOutcome.NotOwner => StatusCode(StatusCodes.Status403Forbidden,
                new { message = "Booking does not belong to the user", code = "NOT_BOOKING_OWNER" }),
            _ => Conflict(new { message = "Booking is not payable (wrong status or expired hold)", code = "BOOKING_NOT_PAYABLE" })
        };
    }

    /// <summary>US0009 CA3, CA7-CA9 — Flow confirmation webhook (server-to-server, idempotent).</summary>
    [HttpPost("confirm")]
    public async Task<IActionResult> Confirm([FromForm] string token, CancellationToken cancellationToken)
    {
        await _paymentService.ConfirmAsync(token, cancellationToken);
        return Ok();
    }

    /// <summary>US0009 CA4-CA6 — Return redirect after the Flow checkout.</summary>
    [HttpGet("return")]
    public async Task<IActionResult> Return([FromQuery] string token, CancellationToken cancellationToken)
    {
        // Flow may redirect the client here before the webhook lands: sync the status first.
        await _paymentService.ConfirmAsync(token, cancellationToken);
        var url = await _paymentService.ResolveReturnUrlAsync(token, cancellationToken);
        return Redirect(url);
    }

    /// <summary>
    /// Dev-only (Flow:UseMock=true): sets the simulated checkout outcome and fires the webhook,
    /// replicating what Flow does server-to-server. Returns the URL the SPA must navigate to.
    /// </summary>
    [HttpPost("mock-outcome")]
    public async Task<IActionResult> MockOutcome(
        [FromBody] MockOutcomeRequest request, CancellationToken cancellationToken)
    {
        if (!_flowSettings.UseMock)
        {
            return NotFound();
        }

        MockFlowClient.SetOutcome(request.Token, request.Paid ? FlowPaymentStatus.Paid : FlowPaymentStatus.Rejected);
        await _paymentService.ConfirmAsync(request.Token, cancellationToken);
        var returnUrl = await _paymentService.ResolveReturnUrlAsync(request.Token, cancellationToken);
        return Ok(new { returnUrl });
    }

    public record MockOutcomeRequest(string Token, bool Paid);
}
