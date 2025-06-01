using ConsultCore31.Application.DTOs.TipoProyecto;
using ConsultCore31.Core.Entities;

namespace ConsultCore31.Application.Interfaces
{
    /// <summary>
    /// Interfaz para el servicio de tipos de proyecto
    /// </summary>
    public interface ITipoProyectoService : IGenericService<TipoProyectoDto, CreateTipoProyectoDto, UpdateTipoProyectoDto, int>
    {
        // Métodos específicos para TipoProyecto si son necesarios
    }
}
