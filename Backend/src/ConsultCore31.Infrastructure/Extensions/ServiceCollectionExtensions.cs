using ConsultCore31.Core.Interfaces;
using ConsultCore31.Infrastructure.Persistence.Repositories;

namespace ConsultCore31.Infrastructure.Extensions;

/// <summary>
/// Extensiones para el registro de servicios de infraestructura
/// </summary>
public static class ServiceCollectionExtensions
{
    /// <summary>
    /// Registra todos los repositorios en el contenedor de dependencias
    /// </summary>
    /// <param name="services">Colección de servicios</param>
    /// <returns>Colección de servicios con los repositorios registrados</returns>
    public static IServiceCollection AddRepositories(this IServiceCollection services)
    {
        // Registrar el repositorio genérico abierto para que el contenedor DI pueda crear instancias cerradas cuando sea necesario
        services.AddScoped(typeof(IGenericRepository<,>), typeof(GenericRepository<,>));

        // Registrar repositorios específicos
        services.AddScoped<IAccesoRepository, AccesoRepository>();
        services.AddScoped<ICategoriaGastoRepository, CategoriaGastoRepository>();
        services.AddScoped<IClienteRepository, ClienteRepository>();
        services.AddScoped<IComentarioTareaRepository, ComentarioTareaRepository>();
        services.AddScoped<IEmpleadoRepository, EmpleadoRepository>();
        services.AddScoped<IEstadoAprobacionRepository, EstadoAprobacionRepository>();
        services.AddScoped<IEstadoEtapaRepository, EstadoEtapaRepository>();
        services.AddScoped<IEstadoProyectoRepository, EstadoProyectoRepository>();
        services.AddScoped<IEstadoTareaRepository, EstadoTareaRepository>();
        services.AddScoped<IEtapaProyectoRepository, EtapaProyectoRepository>();
        services.AddScoped<IFrecuenciaMedicionRepository, FrecuenciaMedicionRepository>();
        services.AddScoped<IMonedaRepository, MonedaRepository>();
        services.AddScoped<IObjetoRepository, ObjetoRepository>();
        services.AddScoped<IObjetoTipoRepository, ObjetoTipoRepository>();
        services.AddScoped<IPerfilRepository, PerfilRepository>();
        services.AddScoped<IPrioridadTareaRepository, PrioridadTareaRepository>();
        services.AddScoped<IProyectoRepository, ProyectoRepository>();
        services.AddScoped<IPuestoRepository, PuestoRepository>();
        services.AddScoped<ITareaRepository, TareaRepository>();
        services.AddScoped<ITipoDocumentoRepository, TipoDocumentoRepository>();
        services.AddScoped<ITipoKPIRepository, TipoKPIRepository>();
        services.AddScoped<ITipoMovimientoViaticoRepository, TipoMovimientoViaticoRepository>();
        services.AddScoped<ITipoProyectoRepository, TipoProyectoRepository>();
        services.AddScoped<IUsuarioRepository, UsuarioRepository>();
        services.AddScoped<IUsuarioTokenRepository, UsuarioTokenRepository>();

        return services;
    }
}