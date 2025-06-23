using ConsultCore31.Application.DTOs.FrecuenciaMedicion;

namespace ConsultCore31.Application.Interfaces
{
    /// <summary>
    /// Interfaz para el servicio de frecuencias de medición
    /// </summary>
    public interface IFrecuenciaMedicionService : IGenericService<FrecuenciaMedicionDto, CreateFrecuenciaMedicionDto, UpdateFrecuenciaMedicionDto, int>
    {
        // Métodos específicos para FrecuenciaMedicion si son necesarios
    }
}