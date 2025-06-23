using ConsultCore31.Application.DTOs.Cliente;

namespace ConsultCore31.Application.Interfaces
{
    /// <summary>
    /// Interfaz para el servicio de clientes
    /// </summary>
    public interface IClienteService : IGenericService<ClienteDto, CreateClienteDto, UpdateClienteDto, int>
    {
        // Aquí se pueden agregar métodos específicos para el servicio de Cliente
    }
}