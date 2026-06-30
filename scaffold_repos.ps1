$repoInterfacesPath = "c:\repos\AI4Devs-finalproject\backend\src\Aura.Core\Interfaces\Repositories"
New-Item -ItemType Directory -Force -Path $repoInterfacesPath | Out-Null

$baseRepo = @"
namespace Aura.Core.Interfaces.Repositories;

public interface IRepository<T> where T : class
{
    Task<T?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<T>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<T> AddAsync(T entity, CancellationToken cancellationToken = default);
    Task UpdateAsync(T entity, CancellationToken cancellationToken = default);
    Task DeleteAsync(T entity, CancellationToken cancellationToken = default);
}
"@
Set-Content -Path "$repoInterfacesPath\IRepository.cs" -Value $baseRepo

$entities = @(
    "User", "UserConsent", "Event", "Template", "Guest",
    "Invitation", "Rsvp", "Accomplice", "MessageTemplate",
    "LiveMessage", "Payment", "DataRetentionJob", "DeliveryLog"
)

foreach ($entity in $entities) {
    $content = @"
using Aura.Core.Models;

namespace Aura.Core.Interfaces.Repositories;

public interface I${entity}Repository : IRepository<${entity}>
{
}
"@
    Set-Content -Path "$repoInterfacesPath\I${entity}Repository.cs" -Value $content
}
