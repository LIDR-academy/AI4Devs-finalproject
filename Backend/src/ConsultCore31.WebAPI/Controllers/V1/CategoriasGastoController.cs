using System;
using System.Threading.Tasks;
using ConsultCore31.Application.DTOs.CategoriaGasto;
using ConsultCore31.Application.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace ConsultCore31.WebAPI.Controllers.V1
{
    /// <summary>
    /// Controlador para gestionar las categorías de gasto
    /// </summary>
    [ApiVersion("1.0")]
    public class CategoriasGastoController : GenericController<CategoriaGastoDto, CreateCategoriaGastoDto, UpdateCategoriaGastoDto, int>
    {
        private readonly ICategoriaGastoService _categoriaGastoService;

        /// <summary>
        /// Constructor
        /// </summary>
        public CategoriasGastoController(
            ICategoriaGastoService categoriaGastoService,
            ILogger<CategoriasGastoController> logger) 
            : base(categoriaGastoService, logger, "categoría de gasto")
        {
            _categoriaGastoService = categoriaGastoService;
        }

        /// <summary>
        /// Obtiene el ID de la entidad desde el DTO
        /// </summary>
        protected override int GetIdFromDto(CategoriaGastoDto dto)
        {
            return dto.Id;
        }

        /// <summary>
        /// Verifica si el ID de la ruta coincide con el ID del DTO
        /// </summary>
        protected override bool IsIdMatchingDto(int id, UpdateCategoriaGastoDto updateDto)
        {
            return id == updateDto.Id;
        }
    }
}
