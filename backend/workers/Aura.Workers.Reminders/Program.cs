using Aura.Infrastructure;
using Aura.Workers.Reminders;

var builder = Host.CreateApplicationBuilder(args);

// Add infrastructure services
builder.Services.AddInfrastructure(builder.Configuration);

// Add the worker
builder.Services.AddHostedService<ReminderSchedulerWorker>();

var host = builder.Build();
host.Run();
