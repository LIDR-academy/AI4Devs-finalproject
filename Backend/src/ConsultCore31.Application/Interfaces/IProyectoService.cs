using ConsultCore31.Application.DTOs.Proyecto;

namespace ConsultCore31.Application.Interfaces
{
    /// <summary>
    /// Interfaz para el servicio de proyectos
    /// </summary>
    public interface IProyectoService : IGenericService<ProyectoDto, CreateProyectoDto, UpdateProyectoDto, int>
    {
        // Aquí se pueden agregar métodos específicos para el servicio de Proyecto
    }
}