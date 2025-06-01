using ConsultCore31.Application.DTOs.Puesto;

namespace ConsultCore31.Application.Interfaces
{
    /// <summary>
    /// Interfaz para el servicio de puestos
    /// </summary>
    public interface IPuestoService : IGenericService<PuestoDto, CreatePuestoDto, UpdatePuestoDto, int>
    {
        // Métodos específicos para Puesto si son necesarios
    }
}
