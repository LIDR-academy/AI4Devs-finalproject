using System;
using System.Threading;
using System.Threading.Tasks;
using Aura.Core.DTOs.Dashboard;

namespace Aura.Core.Interfaces.Services;

public interface IDashboardService
{
    Task<DashboardStatsResponse> GetDashboardStatsAsync(string eventSlug, Guid userId, CancellationToken cancellationToken = default);
    Task<byte[]> ExportGuestListCsvAsync(string eventSlug, Guid userId, CancellationToken cancellationToken = default);
}
