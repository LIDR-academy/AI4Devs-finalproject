using ConsultCore31.Application.Common.Mappings;
using ConsultCore31.Application.Interfaces;
using ConsultCore31.Application.Services;
using ConsultCore31.WebAPI.Services;
using ConsultCore31.WebAPI.Services.Interfaces;

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

            // Registrar servicios de autenticación y tokens
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<ITokenService, TokenService>();

            // Registrar servicios de entidades
            services.AddScoped<ICategoriaGastoService, CategoriaGastoService>();
            services.AddScoped<IClienteService, ClienteService>();
            services.AddScoped<IComentarioTareaService, ComentarioTareaService>();
            services.AddScoped<IEmpleadoService, EmpleadoService>();
            services.AddScoped<IEstadoAprobacionService, EstadoAprobacionService>();
            services.AddScoped<IEstadoEtapaService, EstadoEtapaService>();
            services.AddScoped<IEstadoProyectoService, EstadoProyectoService>();
            services.AddScoped<IEstadoTareaService, EstadoTareaService>();
            services.AddScoped<IEtapaProyectoService, EtapaProyectoService>();
            services.AddScoped<IFrecuenciaMedicionService, FrecuenciaMedicionService>();
            services.AddScoped<IMonedaService, MonedaService>();
            services.AddScoped<IPrioridadTareaService, PrioridadTareaService>();
            services.AddScoped<IProyectoService, ProyectoService>();
            services.AddScoped<IPuestoService, PuestoService>();
            services.AddScoped<ITareaService, TareaService>();
            services.AddScoped<ITipoDocumentoService, TipoDocumentoService>();
            services.AddScoped<ITipoKPIService, TipoKPIService>();
            services.AddScoped<ITipoMovimientoViaticoService, TipoMovimientoViaticoService>();
            services.AddScoped<ITipoProyectoService, TipoProyectoService>();

            // Registrar ApplicationHealthService como singleton y como servicio hospedado
            // Esto permite que sea inyectable en controladores y también se ejecute en segundo plano
            services.AddSingleton<ApplicationHealthService>();
            services.AddSingleton<IApplicationHealthService>(provider => provider.GetRequiredService<ApplicationHealthService>());
            services.AddHostedService(provider => provider.GetRequiredService<ApplicationHealthService>());

            return services;
        }
    }
}