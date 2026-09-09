using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using TejaFlow.Application.Common.Interfaces;
using TejaFlow.Infrastructure.Auth;
using TejaFlow.Infrastructure.Persistence;

namespace TejaFlow.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.Configure<JwtOptions>(configuration.GetSection(JwtOptions.SectionName));
        services.AddSingleton<IPasswordHasher, Pbkdf2PasswordHasher>();
        services.AddSingleton<IJwtTokenService, JwtTokenService>();

        var connectionString = configuration.GetConnectionString("TejaFlowDb")
            ?? throw new InvalidOperationException("Connection string 'TejaFlowDb' was not found.");

        services.AddDbContext<TejaFlowDbContext>(options =>
        {
            options.UseSqlServer(connectionString);
        });

        services.AddScoped<ITejaFlowDbContext>(provider =>
            provider.GetRequiredService<TejaFlowDbContext>());

        return services;
    }
}
