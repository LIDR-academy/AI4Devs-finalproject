using ConsultCore31.Core.Interfaces;
using ConsultCore31.Infrastructure.Persistence.Repositories;

namespace ConsultCore31.Infrastructure.DependencyInjection
{
    /// <summary>
    /// Extensiones para registrar los repositorios en el contenedor de dependencias
    /// </summary>
    public static class RepositoryServiceCollectionExtensions
    {
        /// <summary>
        /// Registra todos los repositorios en el contenedor de dependencias
        /// </summary>
        public static IServiceCollection AddRepositories(this IServiceCollection services)
        {
            // Registrar repositorios específicos
            services.AddScoped<ICategoriaGastoRepository, CategoriaGastoRepository>();
            services.AddScoped<IClienteRepository, ClienteRepository>();
            services.AddScoped<IEmpleadoRepository, EmpleadoRepository>();
            services.AddScoped<IEstadoTareaRepository, EstadoTareaRepository>();
            services.AddScoped<IEstadoProyectoRepository, EstadoProyectoRepository>();
            services.AddScoped<IEstadoEtapaRepository, EstadoEtapaRepository>();
            services.AddScoped<IPrioridadTareaRepository, PrioridadTareaRepository>();
            services.AddScoped<ITipoProyectoRepository, TipoProyectoRepository>();
            services.AddScoped<ITipoDocumentoRepository, TipoDocumentoRepository>();
            services.AddScoped<ITipoKPIRepository, TipoKPIRepository>();
            services.AddScoped<IFrecuenciaMedicionRepository, FrecuenciaMedicionRepository>();
            services.AddScoped<IEstadoAprobacionRepository, EstadoAprobacionRepository>();
            services.AddScoped<IMonedaRepository, MonedaRepository>();
            services.AddScoped<ITipoMovimientoViaticoRepository, TipoMovimientoViaticoRepository>();
            services.AddScoped<IPuestoRepository, PuestoRepository>();
            services.AddScoped<IProyectoRepository, ProyectoRepository>();
            services.AddScoped<IEtapaProyectoRepository, EtapaProyectoRepository>();
            services.AddScoped<ITareaRepository, TareaRepository>();
            services.AddScoped<IComentarioTareaRepository, ComentarioTareaRepository>();

            // Aquí se registrarán los demás repositorios específicos

            return services;
        }
    }
}