using Aura.Core.DTOs.Guests;
using Aura.Core.Enums;
using FluentValidation;

namespace Aura.Core.Validators.Guests;

public class ImportGuestRowValidator : AbstractValidator<ImportGuestRow>
{
    public ImportGuestRowValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(200).WithMessage("Name cannot exceed 200 characters.");

        RuleFor(x => x.Email)
            .EmailAddress().WithMessage("A valid email is required.")
            .When(x => !string.IsNullOrWhiteSpace(x.Email));

        RuleFor(x => x.Phone)
            .Matches(@"^\+[1-9]\d{1,14}$").WithMessage("Phone must be in E.164 format (e.g. +1234567890).")
            .When(x => !string.IsNullOrWhiteSpace(x.Phone));

        RuleFor(x => x.Category)
            .Must(category => Enum.TryParse<GuestCategory>(category, true, out _))
            .WithMessage("Invalid category. Must be one of: " + string.Join(", ", Enum.GetNames<GuestCategory>()))
            .When(x => !string.IsNullOrWhiteSpace(x.Category));
    }
}
