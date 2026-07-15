using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Aura.Core.DTOs.Dashboard;

namespace Aura.Core.Interfaces.Repositories;

public interface IDashboardRepository
{
    Task<DashboardStatsResponse> GetStatsAsync(Guid eventId, CancellationToken cancellationToken = default);
    Task<IEnumerable<GuestExportDto>> GetGuestExportDataAsync(Guid eventId, CancellationToken cancellationToken = default);
}
