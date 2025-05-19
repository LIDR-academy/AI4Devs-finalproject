using System;
using System.Reflection;
using ConsultCore31.Core.Interfaces;
using ConsultCore31.Core.Interfaces.Repositories;
using ConsultCore31.Infrastructure.Persistence;
using ConsultCore31.Infrastructure.Persistence.Context;
using ConsultCore31.Infrastructure.Persistence.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace ConsultCore31.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
        {
            // Configuración de DbContext
            services.AddDbContext<AppDbContext>(options =>
                options.UseSqlServer(
                    configuration.GetConnectionString("DefaultConnection"),
                    b => b.MigrationsAssembly(typeof(AppDbContext).Assembly.FullName)));

            // Registrar repositorios genéricos
            services.AddScoped(typeof(IRepository<>), typeof(RepositoryBase<>));

            // Registrar UnitOfWork
            services.AddScoped<IUnitOfWork, UnitOfWork>();

            return services;
        }
    }
}
