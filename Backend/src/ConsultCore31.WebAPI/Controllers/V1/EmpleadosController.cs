using System;
using System.Threading.Tasks;
using ConsultCore31.Application.DTOs.Empleado;
using ConsultCore31.Application.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace ConsultCore31.WebAPI.Controllers.V1
{
    /// <summary>
    /// Controlador para gestionar los empleados
    /// </summary>
    [ApiVersion("1.0")]
    public class EmpleadosController : GenericController<EmpleadoDto, CreateEmpleadoDto, UpdateEmpleadoDto, int>
    {
        private readonly IEmpleadoService _empleadoService;

        /// <summary>
        /// Constructor
        /// </summary>
        public EmpleadosController(
            IEmpleadoService empleadoService,
            ILogger<EmpleadosController> logger) 
            : base(empleadoService, logger, "empleado")
        {
            _empleadoService = empleadoService;
        }

        /// <summary>
        /// Obtiene el ID de la entidad desde el DTO
        /// </summary>
        protected override int GetIdFromDto(EmpleadoDto dto)
        {
            return dto.Id;
        }

        /// <summary>
        /// Verifica si el ID de la ruta coincide con el ID del DTO
        /// </summary>
        protected override bool IsIdMatchingDto(int id, UpdateEmpleadoDto updateDto)
        {
            return id == updateDto.Id;
        }
    }
}
