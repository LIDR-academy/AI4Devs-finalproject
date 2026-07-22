using Aura.Infrastructure.Data;
using Aura.Workers.SSG;
using Aura.Workers.SSG.Services;
using Microsoft.EntityFrameworkCore;
using Minio;
using StackExchange.Redis;

var builder = Host.CreateApplicationBuilder(args);

builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
           .UseSnakeCaseNamingConvention();
});

var redisConn = builder.Configuration.GetConnectionString("RedisConnection") ?? "localhost:6379";
builder.Services.AddSingleton<IConnectionMultiplexer>(sp => ConnectionMultiplexer.Connect(redisConn));

builder.Services.AddHttpClient<CdnInvalidator>();
builder.Services.AddTransient<CdnInvalidator>();

builder.Services.AddSingleton<IMinioClient>(sp => 
{
    var config = sp.GetRequiredService<IConfiguration>();
    return new MinioClient()
        .WithEndpoint(config["Minio:Endpoint"] ?? "localhost:9000")
        .WithCredentials(
            config["Minio:AccessKey"] ?? "minioadmin",
            config["Minio:SecretKey"] ?? "minioadmin"
        )
        .WithSSL(config.GetValue<bool>("Minio:UseSSL", false))
        .Build();
});
builder.Services.AddSingleton<MinioUploader>();
builder.Services.AddSingleton<TemplateRenderer>();

builder.Services.AddHostedService<StaticSiteGeneratorWorker>();

var host = builder.Build();
host.Run();
