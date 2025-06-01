using System;
using System.ComponentModel.DataAnnotations;

namespace ConsultCore31.Application.DTOs.ObjetoTipo
{
    /// <summary>
    /// DTO para la entidad ObjetoTipo
    /// </summary>
    public class ObjetoTipoDto
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "El nombre del tipo de objeto es requerido")]
        [StringLength(100, ErrorMessage = "El nombre del tipo de objeto no puede exceder los 100 caracteres")]
        public string Nombre { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "La descripción no puede exceder los 500 caracteres")]
        public string Descripcion { get; set; } = string.Empty;

        public bool Activo { get; set; } = true;
    }

    /// <summary>
    /// DTO para la creación de un tipo de objeto
    /// </summary>
    public class CreateObjetoTipoDto
    {
        [Required(ErrorMessage = "El nombre del tipo de objeto es requerido")]
        [StringLength(100, ErrorMessage = "El nombre del tipo de objeto no puede exceder los 100 caracteres")]
        public string Nombre { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "La descripción no puede exceder los 500 caracteres")]
        public string Descripcion { get; set; } = string.Empty;
    }

    /// <summary>
    /// DTO para la actualización de un tipo de objeto
    /// </summary>
    public class UpdateObjetoTipoDto
    {
        [Required(ErrorMessage = "El ID es requerido")]
        public int Id { get; set; }

        [Required(ErrorMessage = "El nombre del tipo de objeto es requerido")]
        [StringLength(100, ErrorMessage = "El nombre del tipo de objeto no puede exceder los 100 caracteres")]
        public string Nombre { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "La descripción no puede exceder los 500 caracteres")]
        public string Descripcion { get; set; } = string.Empty;

        public bool Activo { get; set; } = true;
    }
}
