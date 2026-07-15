using Aura.Core.Interfaces.Services;
using Aura.Infrastructure.Data;
using Aura.Infrastructure.Queue;
using Aura.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using StackExchange.Redis;

namespace Aura.Workers.WhatsApp;

public class Program
{
    public static void Main(string[] args)
    {
        CreateHostBuilder(args).Build().Run();
    }

    public static IHostBuilder CreateHostBuilder(string[] args) =>
        Host.CreateDefaultBuilder(args)
            .ConfigureServices((hostContext, services) =>
            {
                var connectionString = hostContext.Configuration.GetConnectionString("DefaultConnection") 
                    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
                
                services.AddDbContext<ApplicationDbContext>(options =>
                    options.UseNpgsql(connectionString, b => b.MigrationsAssembly("Aura.Infrastructure")));

                var redisConnectionString = hostContext.Configuration.GetConnectionString("Redis")
                    ?? throw new InvalidOperationException("Connection string 'Redis' not found.");
                var multiplexer = ConnectionMultiplexer.Connect(redisConnectionString);
                services.AddSingleton<IConnectionMultiplexer>(multiplexer);

                services.AddScoped<IQueueService, DragonflyQueueService>();
                
                services.AddHttpClient<IWhatsAppService, MetaWhatsAppService>();
                services.AddScoped<IWhatsAppService, MetaWhatsAppService>();

                // Add Repositories
                services.AddScoped<Aura.Core.Interfaces.Repositories.IDeliveryLogRepository, Aura.Infrastructure.Repositories.DeliveryLogRepository>();
                services.AddScoped<Aura.Core.Interfaces.Repositories.IInvitationRepository, Aura.Infrastructure.Repositories.InvitationRepository>();

                services.AddHostedService<WhatsAppDispatcherWorker>();
            });
}
