using Aura.Core.DTOs.Rsvp;
using FluentValidation;

namespace Aura.Core.Validators.Rsvp;

public class SubmitRsvpRequestValidator : AbstractValidator<SubmitRsvpRequest>
{
    public SubmitRsvpRequestValidator()
    {
        RuleFor(x => x.Attendance)
            .IsInEnum().WithMessage("Invalid attendance value.");

        RuleFor(x => x.DietaryRestrictions)
            .MaximumLength(500).WithMessage("Dietary restrictions must not exceed 500 characters.");

        RuleFor(x => x.PlusOneName)
            .MaximumLength(100).WithMessage("Plus one name must not exceed 100 characters.");

        RuleFor(x => x.PersonalMessage)
            .MaximumLength(1000).WithMessage("Personal message must not exceed 1000 characters.");
    }
}
