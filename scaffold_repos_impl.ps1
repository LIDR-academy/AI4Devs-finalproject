$reposPath = "c:\repos\AI4Devs-finalproject\backend\src\Aura.Infrastructure\Repositories"

$baseRepo = @"
using Aura.Core.Interfaces.Repositories;
using Aura.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Aura.Infrastructure.Repositories;

public class Repository<T> : IRepository<T> where T : class
{
    protected readonly ApplicationDbContext _context;
    
    public Repository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<T?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Set<T>().FindAsync(new object[] { id }, cancellationToken);
    }

    public async Task<IReadOnlyList<T>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Set<T>().ToListAsync(cancellationToken);
    }

    public async Task<T> AddAsync(T entity, CancellationToken cancellationToken = default)
    {
        await _context.Set<T>().AddAsync(entity, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task UpdateAsync(T entity, CancellationToken cancellationToken = default)
    {
        _context.Set<T>().Update(entity);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(T entity, CancellationToken cancellationToken = default)
    {
        _context.Set<T>().Remove(entity);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
"@
Set-Content -Path "$reposPath\Repository.cs" -Value $baseRepo

$entities = @(
    "User", "UserConsent", "Event", "Template", "Guest",
    "Invitation", "Rsvp", "Accomplice", "MessageTemplate",
    "LiveMessage", "Payment", "DataRetentionJob", "DeliveryLog"
)

foreach ($entity in $entities) {
    $content = @"
using Aura.Core.Interfaces.Repositories;
using Aura.Core.Models;
using Aura.Infrastructure.Data;

namespace Aura.Infrastructure.Repositories;

public class ${entity}Repository : Repository<${entity}>, I${entity}Repository
{
    public ${entity}Repository(ApplicationDbContext context) : base(context)
    {
    }
}
"@
    Set-Content -Path "$reposPath\${entity}Repository.cs" -Value $content
}

# Update DependencyInjection to register repositories
$diContent = @"
using Aura.Core.Interfaces.Repositories;
using Aura.Infrastructure.Data;
using Aura.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Aura.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<ApplicationDbContext>(options =>
        {
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection"))
                   .UseSnakeCaseNamingConvention();
        });

        services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
"@
foreach ($entity in $entities) {
    $diContent += "`n        services.AddScoped<I${entity}Repository, ${entity}Repository>();"
}
$diContent += @"

        return services;
    }
}
"@
Set-Content -Path "c:\repos\AI4Devs-finalproject\backend\src\Aura.Infrastructure\DependencyInjection.cs" -Value $diContent
