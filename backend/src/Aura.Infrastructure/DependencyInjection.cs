using Aura.Core.Interfaces.Repositories;
using Aura.Core.Interfaces.Services;
using Aura.Core.Services;
using Aura.Infrastructure.Data;
using Aura.Infrastructure.Repositories;
using Aura.Infrastructure.Services;
using Aura.Infrastructure.Queue;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Minio;

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

        services.Configure<Aura.Core.Configuration.StripeOptions>(options => configuration.GetSection(Aura.Core.Configuration.StripeOptions.SectionName).Bind(options));

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
        services.AddScoped<IDashboardRepository, DashboardRepository>();

        // Auth & Email Services
        services.AddScoped<IMagicLinkService, MagicLinkService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IEmailService, SmtpEmailService>();

        services.AddScoped<ISlugGenerator, SlugGenerator>();
        services.AddScoped<IEventService, EventService>();
        services.AddScoped<IGuestService, GuestService>();
        services.AddScoped<IDashboardService, DashboardService>();
        services.AddScoped<IInvitationService, InvitationService>();
        services.AddScoped<FluentValidation.IValidator<Aura.Core.DTOs.Guests.AddGuestRequest>, Aura.Core.Validators.Guests.AddGuestRequestValidator>();
        services.AddScoped<FluentValidation.IValidator<Aura.Core.DTOs.Guests.ImportGuestRow>, Aura.Core.Validators.Guests.ImportGuestRowValidator>();

        services.AddScoped<IPaymentService, StripePaymentService>();

        services.AddScoped<Minio.IMinioClient>(sp => 
        {
            var config = sp.GetRequiredService<IConfiguration>();
            return new Minio.MinioClient()
                .WithEndpoint(config["Minio:Endpoint"] ?? "localhost:9000")
                .WithCredentials(
                    config["Minio:AccessKey"] ?? "minioadmin",
                    config["Minio:SecretKey"] ?? "minioadmin"
                )
                .WithSSL(config.GetValue<bool>("Minio:UseSSL", false))
                .Build();
        });
        services.AddScoped<IObjectStorageService, MinioObjectStorageService>();

        // Queue
        var redisConn = configuration.GetConnectionString("RedisConnection") ?? "localhost:6379";
        services.AddSingleton<IConnectionMultiplexer>(sp => ConnectionMultiplexer.Connect(redisConn));
        services.AddSingleton<IQueueService, DragonflyQueueService>();

        return services;
    }
}
