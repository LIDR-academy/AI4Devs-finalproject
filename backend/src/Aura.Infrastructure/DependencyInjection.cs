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
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IUserConsentRepository, UserConsentRepository>();
        services.AddScoped<IEventRepository, EventRepository>();
        services.AddScoped<ITemplateRepository, TemplateRepository>();
        services.AddScoped<IGuestRepository, GuestRepository>();
        services.AddScoped<IInvitationRepository, InvitationRepository>();
        services.AddScoped<IRsvpRepository, RsvpRepository>();
        services.AddScoped<IAccompliceRepository, AccompliceRepository>();
        services.AddScoped<IMessageTemplateRepository, MessageTemplateRepository>();
        services.AddScoped<ILiveMessageRepository, LiveMessageRepository>();
        services.AddScoped<IPaymentRepository, PaymentRepository>();
        services.AddScoped<IDataRetentionJobRepository, DataRetentionJobRepository>();
        services.AddScoped<IDeliveryLogRepository, DeliveryLogRepository>();
        return services;
    }
}
