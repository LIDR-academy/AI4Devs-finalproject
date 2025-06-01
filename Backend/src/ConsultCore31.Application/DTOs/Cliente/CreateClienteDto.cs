using System;
using System.ComponentModel.DataAnnotations;
using ConsultCore31.Application.DTOs.Common;

namespace ConsultCore31.Application.DTOs.Cliente
{
    /// <summary>
    /// DTO para crear un nuevo cliente en el sistema
    /// </summary>
    public class CreateClienteDto : CreateBaseDto
    {
        /// <summary>
        /// Nombre del cliente
        /// </summary>
        [Required(ErrorMessage = "El nombre del cliente es obligatorio")]
        [StringLength(100, ErrorMessage = "El nombre del cliente no puede exceder los 100 caracteres")]
        public string Nombre { get; set; } = string.Empty;

        /// <summary>
        /// Nombre comercial del cliente
        /// </summary>
        [StringLength(100, ErrorMessage = "El nombre comercial no puede exceder los 100 caracteres")]
        public string? NombreComercial { get; set; }

        /// <summary>
        /// RFC del cliente
        /// </summary>
        [StringLength(13, ErrorMessage = "El RFC no puede exceder los 13 caracteres")]
        [RegularExpression(@"^([A-ZÑ&]{3,4})?([0-9]{2}(0[1-9]|1[0-2])(0[1-9]|1[0-9]|2[0-9]|3[0-1]))?([A-Z\d]{3})?$", 
            ErrorMessage = "El formato del RFC no es válido")]
        public string? RFC { get; set; }

        /// <summary>
        /// Dirección del cliente
        /// </summary>
        [StringLength(200, ErrorMessage = "La dirección no puede exceder los 200 caracteres")]
        public string? Direccion { get; set; }

        /// <summary>
        /// Teléfono del cliente
        /// </summary>
        [StringLength(15, ErrorMessage = "El teléfono no puede exceder los 15 caracteres")]
        [RegularExpression(@"^(\+?\d{1,3}[- ]?)?\d{10}$", ErrorMessage = "El formato del teléfono no es válido")]
        public string? Telefono { get; set; }

        /// <summary>
        /// Correo electrónico del cliente
        /// </summary>
        [StringLength(100, ErrorMessage = "El correo electrónico no puede exceder los 100 caracteres")]
        [EmailAddress(ErrorMessage = "El formato del correo electrónico no es válido")]
        public string? Email { get; set; }

        /// <summary>
        /// Sitio web del cliente
        /// </summary>
        [StringLength(100, ErrorMessage = "El sitio web no puede exceder los 100 caracteres")]
        [Url(ErrorMessage = "El formato del sitio web no es válido")]
        public string? SitioWeb { get; set; }

        /// <summary>
        /// Industria a la que pertenece el cliente
        /// </summary>
        [StringLength(50, ErrorMessage = "La industria no puede exceder los 50 caracteres")]
        public string? Industria { get; set; }

        /// <summary>
        /// Indica si el cliente está activo
        /// </summary>
        public bool Activo { get; set; } = true;

        /// <summary>
        /// Identificador del objeto asociado
        /// </summary>
        public int ObjetoId { get; set; } = 4; // Valor predeterminado para objeto de tipo Cliente
    }
}
