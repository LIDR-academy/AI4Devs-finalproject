using Aura.Infrastructure;
using Aura.Workers.ThankYouCards;

var builder = Host.CreateApplicationBuilder(args);

// Add infrastructure services
builder.Services.AddInfrastructure(builder.Configuration);

// Add the worker
builder.Services.AddHostedService<ThankYouCardWorker>();

var host = builder.Build();
host.Run();
