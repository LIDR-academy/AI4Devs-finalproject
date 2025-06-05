using Asp.Versioning;

using ConsultCore31.Application.DTOs.FrecuenciaMedicion;
using ConsultCore31.Application.Interfaces;

namespace ConsultCore31.WebAPI.Controllers.V1
{
    /// <summary>
    /// Controlador para gestionar las frecuencias de medición
    /// </summary>
    [ApiVersion("1.0")]
    public class FrecuenciasMedicionController : GenericController<FrecuenciaMedicionDto, CreateFrecuenciaMedicionDto, UpdateFrecuenciaMedicionDto, int>
    {
        private readonly IFrecuenciaMedicionService _frecuenciaMedicionService;

        /// <summary>
        /// Constructor que inicializa el controlador con el servicio y el logger
        /// </summary>
        /// <param name="frecuenciaMedicionService">Servicio de frecuencias de medición</param>
        /// <param name="logger">Logger para registro de eventos</param>
        public FrecuenciasMedicionController(
            IFrecuenciaMedicionService frecuenciaMedicionService,
            ILogger<FrecuenciasMedicionController> logger)
            : base(frecuenciaMedicionService, logger, "frecuencia de medición")
        {
            _frecuenciaMedicionService = frecuenciaMedicionService;
        }

        /// <summary>
        /// Obtiene el ID del DTO
        /// </summary>
        /// <param name="dto">DTO de la frecuencia de medición</param>
        /// <returns>ID de la frecuencia de medición</returns>
        protected override int GetIdFromDto(FrecuenciaMedicionDto dto)
        {
            return dto.Id;
        }

        /// <summary>
        /// Verifica si el ID de la ruta coincide con el ID del DTO
        /// </summary>
        /// <param name="id">ID de la ruta</param>
        /// <param name="updateDto">DTO de actualización</param>
        /// <returns>True si los IDs coinciden, False en caso contrario</returns>
        protected override bool IsIdMatchingDto(int id, UpdateFrecuenciaMedicionDto updateDto)
        {
            return id == updateDto.Id;
        }
    }
}