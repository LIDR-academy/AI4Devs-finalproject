using Aura.Core.DTOs.MessageTemplates;

namespace Aura.Core.Interfaces.Services;

public interface IMessageTemplateService
{
    Task CreateDefaultTemplatesAsync(Guid eventId, CancellationToken cancellationToken = default);
    Task<IEnumerable<MessageTemplateResponse>> GetTemplatesByEventAsync(string eventSlug, CancellationToken cancellationToken = default);
    Task<MessageTemplateResponse> UpdateTemplateAsync(string eventSlug, Guid templateId, UpdateMessageTemplateRequest request, CancellationToken cancellationToken = default);
}
