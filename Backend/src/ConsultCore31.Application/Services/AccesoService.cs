using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using AutoMapper;

using ConsultCore31.Application.DTOs.Acceso;
using ConsultCore31.Application.Interfaces;
using ConsultCore31.Core.Entities;
using ConsultCore31.Core.Interfaces;
using ConsultCore31.Core.Specifications;

using Microsoft.Extensions.Logging;
using VerificarAccesoDto = ConsultCore31.Application.DTOs.Acceso.VerificarAccesoDto;

namespace ConsultCore31.Application.Services
{
    public class AccesoService : IAccesoService
    {
        private readonly IAccesoRepository _accesoRepository;
        private readonly IPerfilRepository _perfilRepository;
        private readonly IObjetoRepository _objetoRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<AccesoService> _logger;

        public AccesoService(
            IAccesoRepository accesoRepository,
            IPerfilRepository perfilRepository,
            IObjetoRepository objetoRepository,
            IMapper mapper,
            ILogger<AccesoService> logger)
        {
            _accesoRepository = accesoRepository ?? throw new ArgumentNullException(nameof(accesoRepository));
            _perfilRepository = perfilRepository ?? throw new ArgumentNullException(nameof(perfilRepository));
            _objetoRepository = objetoRepository ?? throw new ArgumentNullException(nameof(objetoRepository));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<IEnumerable<AccesoDto>> GetAllAccesosAsync()
        {
            try
            {
                var accesos = await _accesoRepository.ListAllAsync();
                return _mapper.Map<IEnumerable<AccesoDto>>(accesos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener todos los accesos");
                throw;
            }
        }

        public async Task<AccesoDto?> GetAccesoByIdsAsync(int perfilId, int objetoId)
        {
            try
            {
                var spec = new AccesoByIdsSpec(perfilId, objetoId);
                var acceso = await _accesoRepository.FirstOrDefaultAsync(spec);

                if (acceso == null)
                {
                    return null;
                }

                return _mapper.Map<AccesoDto>(acceso);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener el acceso por IDs");
                throw;
            }
        }

        public async Task<AccesoDto> CreateOrUpdateAccesoAsync(AccesoDto dto)
        {
            try
            {
                // Verificar si el perfil existe
                var perfil = await _perfilRepository.GetByIdAsync(dto.PerfilId);
                if (perfil == null)
                {
                    throw new KeyNotFoundException($"No se encontró el perfil con ID {dto.PerfilId}");
                }

                // Verificar si el objeto existe
                var objeto = await _objetoRepository.GetByIdAsync(dto.ObjetoId);
                if (objeto == null)
                {
                    throw new KeyNotFoundException($"No se encontró el objeto con ID {dto.ObjetoId}");
                }

                // Buscar si ya existe un acceso para este perfil y objeto
                var spec = new AccesoByIdsSpec(dto.PerfilId, dto.ObjetoId);
                var accesos = await _accesoRepository.ListAsync(spec);
                var accesoExistente = accesos.FirstOrDefault();

                if (accesoExistente != null)
                {
                    // Actualizar acceso existente
                    accesoExistente.Activo = dto.Activo;
                    await _accesoRepository.UpdateAsync(accesoExistente);
                    return _mapper.Map<AccesoDto>(accesoExistente);
                }
                else
                {
                    // Crear nuevo acceso
                    var nuevoAcceso = _mapper.Map<Acceso>(dto);
                    nuevoAcceso.FechaCreacion = DateTime.UtcNow;
                    nuevoAcceso.FechaModificacion = DateTime.UtcNow;

                    var accesoCreado = await _accesoRepository.AddAsync(nuevoAcceso);
                    return _mapper.Map<AccesoDto>(accesoCreado);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear o actualizar el acceso");
                throw;
            }
        }

        public async Task<bool> DeleteAccesoAsync(int perfilId, int objetoId)
        {
            try
            {
                var spec = new AccesoByIdsSpec(perfilId, objetoId);
                var accesos = await _accesoRepository.ListAsync(spec);
                var acceso = accesos.FirstOrDefault();

                if (acceso == null)
                {
                    return false;
                }

                await _accesoRepository.DeleteAsync(acceso);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar el acceso");
                throw;
            }
        }

        public async Task<bool> TieneAccesoAsync(int perfilId, int objetoId)
        {
            var spec = new AccesoByIdsSpec(perfilId, objetoId);
            var acceso = await _accesoRepository.FirstOrDefaultAsync(spec);
            return acceso != null && acceso.Activo;
        }

        public async Task<VerificarAccesoDto> VerificarAccesoAsync(int perfilId, int objetoId)
        {
            try
            {
                _logger.LogInformation($"Verificando acceso para perfilId: {perfilId}, objetoId: {objetoId}");

                // Verificar si el perfil existe
                var perfil = await _perfilRepository.GetByIdAsync(perfilId);
                if (perfil == null)
                {
                    return new VerificarAccesoDto
                    {
                        TieneAcceso = false,
                        Mensaje = $"No se encontró el perfil con ID {perfilId}"
                    };
                }

                // Verificar si el objeto existe
                var objeto = await _objetoRepository.GetByIdAsync(objetoId);
                if (objeto == null)
                {
                    return new VerificarAccesoDto
                    {
                        TieneAcceso = false,
                        Mensaje = $"No se encontró el objeto con ID {objetoId}"
                    };
                }

                // Verificar si existe un acceso activo
                var tieneAcceso = await TieneAccesoAsync(perfilId, objetoId);

                return new VerificarAccesoDto
                {
                    TieneAcceso = tieneAcceso,
                    Mensaje = tieneAcceso
                        ? "Acceso permitido"
                        : $"El perfil {perfil.PerfilNombre} no tiene acceso al objeto {objeto.ObjetoNombre}"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al verificar el acceso para perfilId: {perfilId}, objetoId: {objetoId}");
                return new VerificarAccesoDto
                {
                    TieneAcceso = false,
                    Mensaje = "Error al verificar el acceso. Por favor, intente nuevamente."
                };
            }
        }

        /// <inheritdoc/>
        public async Task<IEnumerable<AccesoDto>> GetAccesosActivosByPerfilIdAsync(int perfilId)
        {
            try
            {
                // Verificar si el perfil existe
                var perfil = await _perfilRepository.GetByIdAsync(perfilId);
                if (perfil == null)
                {
                    throw new KeyNotFoundException($"No se encontró el perfil con ID {perfilId}");
                }

                // Obtener todos los accesos activos para el perfil
                var accesos = await _accesoRepository.ListAsync(new AccesosActivosByPerfilIdSpec(perfilId));
                
                // Mapear a DTOs y devolver
                return _mapper.Map<IEnumerable<AccesoDto>>(accesos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al obtener los accesos activos para el perfil: {perfilId}");
                throw;
            }
        }

        public async Task<bool> UpdateAccesoStatusAsync(int perfilId, int objetoId, bool activo)
        {
            try
            {
                _logger.LogInformation("Actualizando estado de acceso. PerfilId: {PerfilId}, ObjetoId: {ObjetoId}, Nuevo estado: {Activo}", 
                    perfilId, objetoId, activo);

                // Verificar si el perfil existe
                var perfil = await _perfilRepository.GetByIdAsync(perfilId);
                if (perfil == null)
                {
                    _logger.LogWarning("No se encontró el perfil con ID {PerfilId}", perfilId);
                    throw new KeyNotFoundException($"No se encontró el perfil con ID {perfilId}");
                }


                // Verificar si el objeto existe
                var objeto = await _objetoRepository.GetByIdAsync(objetoId);
                if (objeto == null)
                {
                    _logger.LogWarning("No se encontró el objeto con ID {ObjetoId}", objetoId);
                    throw new KeyNotFoundException($"No se encontró el objeto con ID {objetoId}");
                }

                // Buscar el acceso existente
                var spec = new AccesoByIdsSpec(perfilId, objetoId);
                var accesos = await _accesoRepository.ListAsync(spec);
                var acceso = accesos.FirstOrDefault();

                if (acceso == null)
                {
                    _logger.LogWarning("No se encontró un acceso para el perfil {PerfilId} y objeto {ObjetoId}", 
                        perfilId, objetoId);
                    throw new KeyNotFoundException($"No se encontró un acceso para el perfil {perfilId} y objeto {objetoId}");
                }

                // Actualizar el estado
                acceso.Activo = activo;
                acceso.FechaModificacion = DateTime.UtcNow;
                
                await _accesoRepository.UpdateAsync(acceso);
                
                _logger.LogInformation("Estado de acceso actualizado correctamente. PerfilId: {PerfilId}, ObjetoId: {ObjetoId}, Nuevo estado: {Activo}", 
                    perfilId, objetoId, activo);
                
                return true;
            }
            catch (KeyNotFoundException)
            {
                // Relanzar las excepciones de KeyNotFoundException para que sean manejadas por el controlador
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar el estado del acceso. PerfilId: {PerfilId}, ObjetoId: {ObjetoId}", 
                    perfilId, objetoId);
                return false;
            }
        }
    }
}