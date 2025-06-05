using Asp.Versioning;

using ConsultCore31.Application.DTOs.EtapaProyecto;
using ConsultCore31.Application.Interfaces;

namespace ConsultCore31.WebAPI.Controllers.V1
{
    /// <summary>
    /// Controlador para gestionar las etapas de proyecto
    /// </summary>
    [ApiVersion("1.0")]
    public class EtapasProyectoController : GenericController<EtapaProyectoDto, CreateEtapaProyectoDto, UpdateEtapaProyectoDto, int>
    {
        private readonly IEtapaProyectoService _etapaProyectoService;

        /// <summary>
        /// Constructor
        /// </summary>
        public EtapasProyectoController(
            IEtapaProyectoService etapaProyectoService,
            ILogger<EtapasProyectoController> logger)
            : base(etapaProyectoService, logger, "etapa de proyecto")
        {
            _etapaProyectoService = etapaProyectoService;
        }

        /// <summary>
        /// Obtiene el ID de la entidad desde el DTO
        /// </summary>
        protected override int GetIdFromDto(EtapaProyectoDto dto)
        {
            return dto.Id;
        }

        /// <summary>
        /// Verifica si el ID de la ruta coincide con el ID del DTO
        /// </summary>
        protected override bool IsIdMatchingDto(int id, UpdateEtapaProyectoDto updateDto)
        {
            return id == updateDto.Id;
        }
    }
}