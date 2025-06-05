using Asp.Versioning;

using ConsultCore31.Application.DTOs.Cliente;
using ConsultCore31.Application.Interfaces;

namespace ConsultCore31.WebAPI.Controllers.V1
{
    /// <summary>
    /// Controlador para gestionar los clientes
    /// </summary>
    [ApiVersion("1.0")]
    public class ClientesController : GenericController<ClienteDto, CreateClienteDto, UpdateClienteDto, int>
    {
        private readonly IClienteService _clienteService;

        /// <summary>
        /// Constructor
        /// </summary>
        public ClientesController(
            IClienteService clienteService,
            ILogger<ClientesController> logger)
            : base(clienteService, logger, "cliente")
        {
            _clienteService = clienteService;
        }

        /// <summary>
        /// Obtiene el ID de la entidad desde el DTO
        /// </summary>
        protected override int GetIdFromDto(ClienteDto dto)
        {
            return dto.Id;
        }

        /// <summary>
        /// Verifica si el ID de la ruta coincide con el ID del DTO
        /// </summary>
        protected override bool IsIdMatchingDto(int id, UpdateClienteDto updateDto)
        {
            return id == updateDto.Id;
        }
    }
}