using AutoMapper;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;

namespace ConsultCore31.Application.Common.Mappings
{
    /// <summary>
    /// Configuración centralizada de AutoMapper
    /// </summary>
    public static class AutoMapperConfig
    {
        /// <summary>
        /// Registra AutoMapper en el contenedor de servicios
        /// </summary>
        /// <param name="services">Colección de servicios donde registrar AutoMapper</param>
        /// <returns>La colección de servicios para permitir encadenamiento</returns>
        public static IServiceCollection AddAutoMapperProfiles(this IServiceCollection services)
        {
            // Crear la configuración de AutoMapper
            var mapperConfig = new MapperConfiguration(cfg =>
            {
                // Registrar todos los perfiles en el ensamblado actual
                cfg.AddMaps(Assembly.GetExecutingAssembly());
            });

            // Crear el mapper como singleton
            IMapper mapper = mapperConfig.CreateMapper();
            services.AddSingleton(mapper);

            return services;
        }
    }
}
