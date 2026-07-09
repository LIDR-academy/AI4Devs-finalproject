using Aura.Core.DTOs.Events;
using Aura.Core.Models;

namespace Aura.Core.Interfaces.Services;

public interface IEventService
{
    Task<EventResponse> CreateEventAsync(Guid userId, CreateEventRequest request);
    Task<EventResponse?> GetEventBySlugAsync(string slug, Guid userId);
    Task<IEnumerable<EventResponse>> GetEventsAsync(Guid userId);
    Task<EventResponse?> UpdateEventAsync(string slug, Guid userId, UpdateEventRequest request);
    Task<bool> DeleteEventAsync(string slug, Guid userId);
}
