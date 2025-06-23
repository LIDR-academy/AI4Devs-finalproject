// InfrastructureRegistration.cs
using ConsultCore31.Core.Interfaces;
using ConsultCore31.Infrastructure.Persistence.Context;
using ConsultCore31.Infrastructure.Persistence.Repositories;

using Microsoft.Extensions.Configuration;

namespace ConsultCore31.Infrastructure
{
    public static class InfrastructureRegistration
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
        {
            if (services == null) throw new ArgumentNullException(nameof(services));
            if (configuration == null) throw new ArgumentNullException(nameof(configuration));

            // Configuración de DbContext
            var connectionString = configuration.GetConnectionString("DefaultConnection");
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                throw new InvalidOperationException("No se encontró la cadena de conexión 'DefaultConnection' en la configuración.");
            }

            services.AddDbContext<AppDbContext>(options =>
            {
                options.UseSqlServer(
                    connectionString,
                    sqlServerOptions =>
                    {
                        sqlServerOptions.MigrationsAssembly(typeof(AppDbContext).Assembly.FullName);
                        sqlServerOptions.EnableRetryOnFailure(
                            maxRetryCount: 5,
                            maxRetryDelay: TimeSpan.FromSeconds(30),
                            errorNumbersToAdd: null);
                    });
            });

            // Repositorios
            services.AddScoped(typeof(IRepository<>), typeof(EfRepository<>));
            services.AddScoped<IAccesoRepository, AccesoRepository>();
            services.AddScoped<IObjetoRepository, ObjetoRepository>();
            services.AddScoped<IObjetoTipoRepository, ObjetoTipoRepository>();
            services.AddScoped<IPerfilRepository, PerfilRepository>();
            services.AddScoped<IUsuarioRepository, UsuarioRepository>();
            services.AddScoped<IUsuarioTokenRepository, UsuarioTokenRepository>();

            // Servicios
            services.AddScoped<Application.Interfaces.IAccesoService, Application.Services.AccesoService>();
            // Agregar otros servicios según sea necesario

            return services;
        }
    }
}