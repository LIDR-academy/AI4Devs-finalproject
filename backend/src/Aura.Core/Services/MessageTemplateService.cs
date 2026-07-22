using Aura.Core.DTOs.MessageTemplates;
using Aura.Core.Exceptions;
using Aura.Core.Interfaces.Repositories;
using Aura.Core.Interfaces.Services;
using Aura.Core.Models;

namespace Aura.Core.Services;

public class MessageTemplateService : IMessageTemplateService
{
    private readonly IMessageTemplateRepository _messageTemplateRepository;
    private readonly IEventRepository _eventRepository;

    public MessageTemplateService(IMessageTemplateRepository messageTemplateRepository, IEventRepository eventRepository)
    {
        _messageTemplateRepository = messageTemplateRepository;
        _eventRepository = eventRepository;
    }

    public async Task CreateDefaultTemplatesAsync(Guid eventId, CancellationToken cancellationToken = default)
    {
        var existingTemplates = await _messageTemplateRepository.GetByEventIdAsync(eventId, cancellationToken);
        if (existingTemplates.Any(x => !x.IsDeleted))
        {
            return; // Templates already exist
        }

        var defaultTemplates = new List<MessageTemplate>
        {
            new MessageTemplate { EventId = eventId, Label = "Bride Leaving", DefaultMessage = "The bride is on her way!", Icon = "car" },
            new MessageTemplate { EventId = eventId, Label = "Ceremony Starting", DefaultMessage = "Please take your seats, the ceremony is about to begin.", Icon = "rings" },
            new MessageTemplate { EventId = eventId, Label = "They Said Yes", DefaultMessage = "It's official! They said yes!", Icon = "heart" },
            new MessageTemplate { EventId = eventId, Label = "Cocktail Hour", DefaultMessage = "Join us for drinks and appetizers at the cocktail area.", Icon = "glass" },
            new MessageTemplate { EventId = eventId, Label = "Dinner Time", DefaultMessage = "Dinner is now being served in the main hall.", Icon = "plate" },
            new MessageTemplate { EventId = eventId, Label = "First Dance", DefaultMessage = "Gather around the dance floor for the first dance.", Icon = "music" },
            new MessageTemplate { EventId = eventId, Label = "Cake Cutting", DefaultMessage = "It's time to cut the cake!", Icon = "cake" },
            new MessageTemplate { EventId = eventId, Label = "Party Time", DefaultMessage = "The dance floor is open, let's party!", Icon = "party" }
        };

        foreach (var template in defaultTemplates)
        {
            await _messageTemplateRepository.AddAsync(template, cancellationToken);
        }
    }

    public async Task<IEnumerable<MessageTemplateResponse>> GetTemplatesByEventAsync(string eventSlug, CancellationToken cancellationToken = default)
    {
        var ev = await _eventRepository.GetBySlugAsync(eventSlug);
        if (ev == null)
        {
            throw new NotFoundException($"Event with slug {eventSlug} not found.");
        }

        var allTemplates = await _messageTemplateRepository.GetByEventIdAsync(ev.Id, cancellationToken);
        var templates = allTemplates.Where(x => !x.IsDeleted);
        
        return templates.Select(t => new MessageTemplateResponse
        {
            Id = t.Id,
            EventId = t.EventId,
            Label = t.Label,
            DefaultMessage = t.DefaultMessage,
            Icon = t.Icon,
            RequiresSwipe = t.RequiresSwipe,
            CreatedAt = t.CreatedAt
        });
    }

    public async Task<MessageTemplateResponse> UpdateTemplateAsync(string eventSlug, Guid templateId, UpdateMessageTemplateRequest request, CancellationToken cancellationToken = default)
    {
        var ev = await _eventRepository.GetBySlugAsync(eventSlug);
        if (ev == null)
        {
            throw new NotFoundException($"Event with slug {eventSlug} not found.");
        }

        var template = await _messageTemplateRepository.GetByIdAsync(templateId, cancellationToken);
        if (template == null || template.EventId != ev.Id || template.IsDeleted)
        {
            throw new NotFoundException($"Message template with ID {templateId} not found.");
        }

        template.Label = request.Label;
        template.DefaultMessage = request.DefaultMessage;
        template.Icon = request.Icon;

        await _messageTemplateRepository.UpdateAsync(template, cancellationToken);

        return new MessageTemplateResponse
        {
            Id = template.Id,
            EventId = template.EventId,
            Label = template.Label,
            DefaultMessage = template.DefaultMessage,
            Icon = template.Icon,
            RequiresSwipe = template.RequiresSwipe,
            CreatedAt = template.CreatedAt
        };
    }
}
