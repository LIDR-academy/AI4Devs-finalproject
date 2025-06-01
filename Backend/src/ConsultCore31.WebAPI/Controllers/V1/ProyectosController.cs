using System;
using System.Threading.Tasks;
using ConsultCore31.Application.DTOs.Proyecto;
using ConsultCore31.Application.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace ConsultCore31.WebAPI.Controllers.V1
{
    /// <summary>
    /// Controlador para gestionar los proyectos
    /// </summary>
    [ApiVersion("1.0")]
    public class ProyectosController : GenericController<ProyectoDto, CreateProyectoDto, UpdateProyectoDto, int>
    {
        private readonly IProyectoService _proyectoService;

        /// <summary>
        /// Constructor
        /// </summary>
        public ProyectosController(
            IProyectoService proyectoService,
            ILogger<ProyectosController> logger) 
            : base(proyectoService, logger, "proyecto")
        {
            _proyectoService = proyectoService;
        }

        /// <summary>
        /// Obtiene el ID de la entidad desde el DTO
        /// </summary>
        protected override int GetIdFromDto(ProyectoDto dto)
        {
            return dto.Id;
        }

        /// <summary>
        /// Verifica si el ID de la ruta coincide con el ID del DTO
        /// </summary>
        protected override bool IsIdMatchingDto(int id, UpdateProyectoDto updateDto)
        {
            return id == updateDto.Id;
        }
    }
}
