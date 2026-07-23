using Aura.Infrastructure;
using Aura.Workers.DataRetention;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;

var builder = Host.CreateApplicationBuilder(args);

// Add Infrastructure
builder.Services.AddInfrastructure(builder.Configuration);

// Add Worker
builder.Services.AddHostedService<DataRetentionWorker>();

var host = builder.Build();
host.Run();
