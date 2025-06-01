using ConsultCore31.Application.Interfaces;
using ConsultCore31.Application.Services;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;

namespace ConsultCore31.Application.DependencyInjection
{
    /// <summary>
    /// Extensiones para registrar los servicios de aplicación en el contenedor de dependencias
    /// </summary>
    public static class ApplicationServiceCollectionExtensions
    {
        /// <summary>
        /// Registra todos los servicios de aplicación en el contenedor de dependencias
        /// </summary>
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            // Registrar AutoMapper
            services.AddAutoMapper(Assembly.GetExecutingAssembly());

            // Registrar servicios específicos
            services.AddScoped<ICategoriaGastoService, CategoriaGastoService>();
            services.AddScoped<IClienteService, ClienteService>();
            services.AddScoped<IEmpleadoService, EmpleadoService>();
            services.AddScoped<IEstadoTareaService, EstadoTareaService>();
            services.AddScoped<IEstadoProyectoService, EstadoProyectoService>();
            services.AddScoped<IEstadoEtapaService, EstadoEtapaService>();
            services.AddScoped<IPrioridadTareaService, PrioridadTareaService>();
            services.AddScoped<ITipoProyectoService, TipoProyectoService>();
            services.AddScoped<ITipoDocumentoService, TipoDocumentoService>();
            services.AddScoped<ITipoKPIService, TipoKPIService>();
            services.AddScoped<IFrecuenciaMedicionService, FrecuenciaMedicionService>();
            services.AddScoped<IEstadoAprobacionService, EstadoAprobacionService>();
            services.AddScoped<IMonedaService, MonedaService>();
            services.AddScoped<ITipoMovimientoViaticoService, TipoMovimientoViaticoService>();
            services.AddScoped<IPuestoService, PuestoService>();
            services.AddScoped<IProyectoService, ProyectoService>();
            services.AddScoped<IEtapaProyectoService, EtapaProyectoService>();
            services.AddScoped<ITareaService, TareaService>();
            services.AddScoped<IComentarioTareaService, ComentarioTareaService>();
            
            // Aquí se registrarán los demás servicios específicos

            return services;
        }
    }
}
