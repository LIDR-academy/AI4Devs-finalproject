using Asp.Versioning.ApiExplorer;

using Microsoft.Extensions.Options;
using Microsoft.OpenApi.Models;

using Swashbuckle.AspNetCore.SwaggerGen;

namespace ConsultCore31.WebAPI.Configurations
{
    /// <summary>
    /// Configura las opciones de Swagger para trabajar con la API versionada
    /// </summary>
    public class ConfigureSwaggerOptions : IConfigureOptions<SwaggerGenOptions>
    {
        private readonly IApiVersionDescriptionProvider _provider;

        /// <summary>
        /// Constructor que recibe el proveedor de descripciones de versiones de API
        /// </summary>
        /// <param name="provider">Proveedor de descripciones de versiones de API</param>
        public ConfigureSwaggerOptions(IApiVersionDescriptionProvider provider)
        {
            _provider = provider;
        }

        /// <summary>
        /// Configura las opciones de SwaggerGen para cada versión de la API
        /// </summary>
        /// <param name="options">Opciones de SwaggerGen</param>
        public void Configure(SwaggerGenOptions options)
        {
            // Agrega un documento de Swagger para cada versión de API descubierta
            foreach (var description in _provider.ApiVersionDescriptions)
            {
                options.SwaggerDoc(
                    description.GroupName,
                    CreateInfoForApiVersion(description));
            }
        }

        /// <summary>
        /// Crea la información de OpenAPI para una versión específica de la API
        /// </summary>
        /// <param name="description">Descripción de la versión de API</param>
        /// <returns>Información de OpenAPI</returns>
        private static OpenApiInfo CreateInfoForApiVersion(ApiVersionDescription description)
        {
            var info = new OpenApiInfo
            {
                Title = "ConsultCore31 API",
                Version = description.ApiVersion.ToString(),
                Description = "API para el sistema ConsultCore31",
                Contact = new OpenApiContact
                {
                    Name = "Equipo de Desarrollo",
                    Email = "desarrollo@consultcore31.com"
                },
                License = new OpenApiLicense
                {
                    Name = "Uso Privado"
                }
            };

            if (description.IsDeprecated)
            {
                info.Description += " Esta versión de la API está obsoleta.";
            }

            return info;
        }
    }
}