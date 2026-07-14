using InkLink.Api.Infrastructure.Data;
using InkLink.Api.Seed;
using Microsoft.EntityFrameworkCore;
using Npgsql;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' is not configured");
var dataSource = new NpgsqlDataSourceBuilder(connectionString)
    .EnableDynamicJson()
    .Build();
builder.Services.AddDbContext<InkLinkDbContext>(options =>
    options.UseNpgsql(dataSource).UseSnakeCaseNamingConvention());

builder.Services.AddScoped<DatabaseSeeder>();

const string FrontendCorsPolicy = "Frontend";
builder.Services.AddCors(options =>
{
    options.AddPolicy(FrontendCorsPolicy, policy =>
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

if (args.Contains("--seed"))
{
    using var scope = app.Services.CreateScope();
    var context = scope.ServiceProvider.GetRequiredService<InkLinkDbContext>();
    await context.Database.MigrateAsync();
    var seeder = scope.ServiceProvider.GetRequiredService<DatabaseSeeder>();
    await seeder.SeedAsync();
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors(FrontendCorsPolicy);
app.UseAuthorization();
app.MapControllers();

app.Run();

// Exposed for integration tests (WebApplicationFactory)
public partial class Program { }
