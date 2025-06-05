using ConsultCore31.Application.Common.Mappings;
using ConsultCore31.Application.Interfaces;
using ConsultCore31.Application.Mappings;
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
            // Utilizar la configuración centralizada de AutoMapper
            services.AddAutoMapperProfiles();

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