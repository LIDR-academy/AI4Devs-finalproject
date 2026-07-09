using Aura.Core.DTOs.Guests;
using FluentValidation;

namespace Aura.Core.Validators.Guests;

public class AddGuestRequestValidator : AbstractValidator<AddGuestRequest>
{
    public AddGuestRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(200).WithMessage("Name cannot exceed 200 characters.");

        RuleFor(x => x.Email)
            .EmailAddress().WithMessage("A valid email is required.")
            .When(x => !string.IsNullOrEmpty(x.Email));

        RuleFor(x => x.Phone)
            .Matches(@"^\+[1-9]\d{1,14}$").WithMessage("Phone must be in E.164 format (e.g. +1234567890).")
            .When(x => !string.IsNullOrEmpty(x.Phone));

        RuleFor(x => x.Category)
            .IsInEnum().WithMessage("Invalid category.")
            .When(x => x.Category.HasValue);
    }
}
