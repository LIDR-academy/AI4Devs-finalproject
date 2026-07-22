using FluentValidation;

namespace Aura.Core.DTOs.LiveMessages;

public class SendLiveMessageRequestValidator : AbstractValidator<SendLiveMessageRequest>
{
    public SendLiveMessageRequestValidator()
    {
        RuleFor(x => x.MessageTemplateId)
            .NotEmpty().WithMessage("Message Template ID is required.");

        RuleFor(x => x.CustomMessage)
            .MaximumLength(500).WithMessage("Custom message must not exceed 500 characters.");
    }
}
