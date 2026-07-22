using Aura.Core.Enums;
using Aura.Core.Exceptions;
using Aura.Core.Interfaces.Repositories;
using Aura.Core.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Aura.Api.Controllers;

[ApiController]
[Route("api")]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentService _paymentService;
    private readonly IEventRepository _eventRepository;

    public PaymentsController(IPaymentService paymentService, IEventRepository eventRepository)
    {
        _paymentService = paymentService;
        _eventRepository = eventRepository;
    }

    [Authorize]
    [HttpPost("events/{slug}/publish")]
    public async Task<IActionResult> PublishEvent(string slug, [FromBody] PublishEventRequest request, CancellationToken cancellationToken)
    {
        var ev = await _eventRepository.GetBySlugAsync(slug);
        if (ev == null)
            return NotFound(new { error = "Event not found" });

        var clientSecret = await _paymentService.CreatePaymentIntentAsync(ev.Id, request.Tier, cancellationToken);

        return Ok(new { clientSecret });
    }

    [HttpPost("payments/webhook")]
    public async Task<IActionResult> StripeWebhook(CancellationToken cancellationToken)
    {
        var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
        var signature = HttpContext.Request.Headers["Stripe-Signature"].ToString();

        try
        {
            await _paymentService.ProcessWebhookAsync(json, signature, cancellationToken);
            return Ok();
        }
        catch (DomainValidationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Internal server error" });
        }
    }
}

public class PublishEventRequest
{
    public PaymentTier Tier { get; set; }
}
