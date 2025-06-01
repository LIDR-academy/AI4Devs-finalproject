using System;
using ConsultCore31.Application.DTOs.Common;

namespace ConsultCore31.Application.DTOs.Cliente
{
    /// <summary>
    /// DTO para representar un cliente en el sistema
    /// </summary>
    public class ClienteDto : BaseDto<int>
    {
        /// <summary>
        /// Nombre del cliente
        /// </summary>
        public string Nombre { get; set; } = string.Empty;

        /// <summary>
        /// Nombre comercial del cliente
        /// </summary>
        public string? NombreComercial { get; set; }

        /// <summary>
        /// RFC del cliente
        /// </summary>
        public string? RFC { get; set; }

        /// <summary>
        /// Dirección del cliente
        /// </summary>
        public string? Direccion { get; set; }

        /// <summary>
        /// Teléfono del cliente
        /// </summary>
        public string? Telefono { get; set; }

        /// <summary>
        /// Correo electrónico del cliente
        /// </summary>
        public string? Email { get; set; }

        /// <summary>
        /// Sitio web del cliente
        /// </summary>
        public string? SitioWeb { get; set; }

        /// <summary>
        /// Industria a la que pertenece el cliente
        /// </summary>
        public string? Industria { get; set; }

        /// <summary>
        /// Fecha de alta del cliente en el sistema
        /// </summary>
        public DateTime FechaAlta { get; set; }

        /// <summary>
        /// Indica si el cliente está activo
        /// </summary>
        public bool Activo { get; set; }

        /// <summary>
        /// Identificador del objeto asociado
        /// </summary>
        public int ObjetoId { get; set; }
    }
}
