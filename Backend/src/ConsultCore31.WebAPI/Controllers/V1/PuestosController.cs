using Asp.Versioning;

using ConsultCore31.Application.DTOs.Puesto;
using ConsultCore31.Application.Interfaces;

namespace ConsultCore31.WebAPI.Controllers.V1
{
    /// <summary>
    /// Controlador para gestionar los puestos
    /// </summary>
    [ApiVersion("1.0")]
    public class PuestosController : GenericController<PuestoDto, CreatePuestoDto, UpdatePuestoDto, int>
    {
        private readonly IPuestoService _puestoService;

        /// <summary>
        /// Constructor que inicializa el controlador con el servicio y el logger
        /// </summary>
        /// <param name="puestoService">Servicio de puestos</param>
        /// <param name="logger">Logger para registro de eventos</param>
        public PuestosController(
            IPuestoService puestoService,
            ILogger<PuestosController> logger)
            : base(puestoService, logger, "puesto")
        {
            _puestoService = puestoService;
        }

        /// <summary>
        /// Obtiene el ID del DTO
        /// </summary>
        /// <param name="dto">DTO del puesto</param>
        /// <returns>ID del puesto</returns>
        protected override int GetIdFromDto(PuestoDto dto)
        {
            return dto.Id;
        }

        /// <summary>
        /// Verifica si el ID de la ruta coincide con el ID del DTO
        /// </summary>
        /// <param name="id">ID de la ruta</param>
        /// <param name="updateDto">DTO de actualización</param>
        /// <returns>True si los IDs coinciden, False en caso contrario</returns>
        protected override bool IsIdMatchingDto(int id, UpdatePuestoDto updateDto)
        {
            return id == updateDto.Id;
        }
    }
}