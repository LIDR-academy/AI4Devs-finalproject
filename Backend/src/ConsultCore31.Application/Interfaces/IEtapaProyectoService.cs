using ConsultCore31.Application.DTOs.EtapaProyecto;

namespace ConsultCore31.Application.Interfaces
{
    /// <summary>
    /// Interfaz para el servicio de etapas de proyecto
    /// </summary>
    public interface IEtapaProyectoService : IGenericService<EtapaProyectoDto, CreateEtapaProyectoDto, UpdateEtapaProyectoDto, int>
    {
        // Aquí se pueden agregar métodos específicos para el servicio de EtapaProyecto
    }
}
