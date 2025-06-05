using Asp.Versioning;

using ConsultCore31.Application.DTOs.EstadoEtapa;
using ConsultCore31.Application.Interfaces;

namespace ConsultCore31.WebAPI.Controllers.V1
{
    /// <summary>
    /// Controlador para gestionar los estados de etapa
    /// </summary>
    [ApiVersion("1.0")]
    public class EstadosEtapaController : GenericController<EstadoEtapaDto, CreateEstadoEtapaDto, UpdateEstadoEtapaDto, int>
    {
        private readonly IEstadoEtapaService _estadoEtapaService;

        /// <summary>
        /// Constructor que inicializa el controlador con el servicio y el logger
        /// </summary>
        /// <param name="estadoEtapaService">Servicio de estados de etapa</param>
        /// <param name="logger">Logger para registro de eventos</param>
        public EstadosEtapaController(
            IEstadoEtapaService estadoEtapaService,
            ILogger<EstadosEtapaController> logger)
            : base(estadoEtapaService, logger, "estado de etapa")
        {
            _estadoEtapaService = estadoEtapaService;
        }

        /// <summary>
        /// Obtiene el ID del DTO
        /// </summary>
        /// <param name="dto">DTO del estado de etapa</param>
        /// <returns>ID del estado de etapa</returns>
        protected override int GetIdFromDto(EstadoEtapaDto dto)
        {
            return dto.Id;
        }

        /// <summary>
        /// Verifica si el ID de la ruta coincide con el ID del DTO
        /// </summary>
        /// <param name="id">ID de la ruta</param>
        /// <param name="updateDto">DTO de actualización</param>
        /// <returns>True si los IDs coinciden, False en caso contrario</returns>
        protected override bool IsIdMatchingDto(int id, UpdateEstadoEtapaDto updateDto)
        {
            return id == updateDto.Id;
        }
    }
}