using ConsultCore31.Application.Interfaces;
using ConsultCore31.Application.Mappings;
using ConsultCore31.Application.Mappings.ObjetoTipo;
using ConsultCore31.Application.Services;

using System.Reflection;

namespace ConsultCore31.WebAPI.Extensions
{
    public static class ServiceCollectionExtensions
    {
        /// <summary>
        /// Agrega los servicios de la capa de aplicación al contenedor de dependencias
        /// </summary>
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            // Registrar AutoMapper con todos los perfiles de mapeo
            services.AddAutoMapper(cfg =>
            {
                cfg.AddProfile<UsuarioProfile>();
                cfg.AddProfile<PerfilProfile>();
                cfg.AddProfile<ObjetoProfile>();
                cfg.AddProfile<ObjetoTipoProfile>();
                cfg.AddProfile<UsuarioTokenProfile>();
                cfg.AddProfile<AccesoProfile>();
                // Agregar otros perfiles de mapeo aquí
            },
            Assembly.GetAssembly(typeof(UsuarioProfile)));

            // Registrar servicios de aplicación
            services.AddScoped<IUsuarioService, UsuarioService>();
            services.AddScoped<IPerfilService, PerfilService>();
            services.AddScoped<IObjetoService, ObjetoService>();
            services.AddScoped<IObjetoTipoService, ObjetoTipoService>();
            services.AddScoped<IUsuarioTokenService, UsuarioTokenService>();
            services.AddScoped<IAccesoService, AccesoService>();
            // Registrar otros servicios de aplicación aquí

            return services;
        }
    }
}