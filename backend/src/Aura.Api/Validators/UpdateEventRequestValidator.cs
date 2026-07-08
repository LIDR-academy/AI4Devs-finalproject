using Aura.Core.DTOs.Events;
using FluentValidation;

namespace Aura.Api.Validators;

public class UpdateEventRequestValidator : AbstractValidator<UpdateEventRequest>
{
    public UpdateEventRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.CoupleNames).NotEmpty().MaximumLength(100);
        RuleFor(x => x.EventDate).NotEmpty();
        RuleFor(x => x.VenueName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.VenueAddress).NotEmpty().MaximumLength(255);
        RuleFor(x => x.PrimaryColor).NotEmpty().Matches("^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$");
        RuleFor(x => x.SecondaryColor).NotEmpty().Matches("^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$");
        RuleFor(x => x.FontFamily).NotEmpty();
    }
}
