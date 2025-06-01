using ConsultCore31.Core.Entities;

namespace ConsultCore31.Core.Interfaces
{
    /// <summary>
    /// Interfaz para el repositorio de clientes
    /// </summary>
    public interface IClienteRepository : IGenericRepository<Cliente, int>
    {
        // Aquí se pueden agregar métodos específicos para la entidad Cliente
    }
}
