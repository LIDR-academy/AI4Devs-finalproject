using Amazon.S3;
using Aura.Api.Health;

namespace Aura.Api;

public static class HealthChecksSetup
{
    public static IServiceCollection AddAuraHealthChecks(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddHealthChecks()
            .AddNpgSql(
                configuration.GetConnectionString("DefaultConnection")!,
                name: "postgresql",
                tags: ["ready"])
            .AddRedis(
                configuration["Dragonfly:ConnectionString"]!,
                name: "dragonfly",
                tags: ["ready"])
            .AddCheck<MinioHealthCheck>(
                name: "minio",
                tags: ["ready"]);

        return services;
    }
}
