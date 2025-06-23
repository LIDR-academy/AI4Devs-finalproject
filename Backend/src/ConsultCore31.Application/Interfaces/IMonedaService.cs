using ConsultCore31.Application.DTOs.Moneda;

namespace ConsultCore31.Application.Interfaces
{
    /// <summary>
    /// Interfaz para el servicio de monedas
    /// </summary>
    public interface IMonedaService : IGenericService<MonedaDto, CreateMonedaDto, UpdateMonedaDto, int>
    {
        // Métodos específicos para Moneda si son necesarios
    }
}