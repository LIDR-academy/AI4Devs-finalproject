using System;
using System.Globalization;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Aura.Core.DTOs.Dashboard;
using Aura.Core.Exceptions;
using Aura.Core.Interfaces.Repositories;
using Aura.Core.Interfaces.Services;
using CsvHelper;
using CsvHelper.Configuration;

namespace Aura.Core.Services;

public class DashboardService : IDashboardService
{
    private readonly IEventRepository _eventRepository;
    private readonly IDashboardRepository _dashboardRepository;

    public DashboardService(IEventRepository eventRepository, IDashboardRepository dashboardRepository)
    {
        _eventRepository = eventRepository;
        _dashboardRepository = dashboardRepository;
    }

    private async Task<Guid> GetEventIdAndVerifyAccessAsync(string eventSlug, Guid userId)
    {
        var evt = await _eventRepository.GetBySlugAsync(eventSlug);
        if (evt == null || evt.UserId != userId)
            throw new NotFoundException("Event not found or access denied.");
        return evt.Id;
    }

    public async Task<DashboardStatsResponse> GetDashboardStatsAsync(string eventSlug, Guid userId, CancellationToken cancellationToken = default)
    {
        var eventId = await GetEventIdAndVerifyAccessAsync(eventSlug, userId);
        return await _dashboardRepository.GetStatsAsync(eventId, cancellationToken);
    }

    public async Task<byte[]> ExportGuestListCsvAsync(string eventSlug, Guid userId, CancellationToken cancellationToken = default)
    {
        var eventId = await GetEventIdAndVerifyAccessAsync(eventSlug, userId);
        var data = await _dashboardRepository.GetGuestExportDataAsync(eventId, cancellationToken);

        using var memoryStream = new MemoryStream();
        using var streamWriter = new StreamWriter(memoryStream);
        
        var config = new CsvConfiguration(CultureInfo.InvariantCulture)
        {
            HasHeaderRecord = true
        };
        
        using var csv = new CsvWriter(streamWriter, config);
        
        csv.WriteRecords(data);
        await streamWriter.FlushAsync();
        
        return memoryStream.ToArray();
    }
}
