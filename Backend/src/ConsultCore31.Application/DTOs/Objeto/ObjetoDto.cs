using System;
using System.ComponentModel.DataAnnotations;

namespace ConsultCore31.Application.DTOs.Objeto
{
    /// <summary>
    /// DTO para la entidad Objeto
    /// </summary>
    public class ObjetoDto
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "El nombre del objeto es requerido")]
        [StringLength(100, ErrorMessage = "El nombre del objeto no puede exceder los 100 caracteres")]
        public string Nombre { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "La descripción no puede exceder los 500 caracteres")]
        public string Descripcion { get; set; } = string.Empty;

        [Required(ErrorMessage = "El tipo de objeto es requerido")]
        public int TipoObjetoId { get; set; }

        public string TipoObjetoNombre { get; set; } = string.Empty;

        public bool Activo { get; set; } = true;
    }

    /// <summary>
    /// DTO para la creación de un objeto
    /// </summary>
    public class CreateObjetoDto
    {
        [Required(ErrorMessage = "El nombre del objeto es requerido")]
        [StringLength(100, ErrorMessage = "El nombre del objeto no puede exceder los 100 caracteres")]
        public string Nombre { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "La descripción no puede exceder los 500 caracteres")]
        public string Descripcion { get; set; } = string.Empty;

        [Required(ErrorMessage = "El tipo de objeto es requerido")]
        public int TipoObjetoId { get; set; }
    }

    /// <summary>
    /// DTO para la actualización de un objeto
    /// </summary>
    public class UpdateObjetoDto
    {
        [Required(ErrorMessage = "El ID es requerido")]
        public int Id { get; set; }

        [Required(ErrorMessage = "El nombre del objeto es requerido")]
        [StringLength(100, ErrorMessage = "El nombre del objeto no puede exceder los 100 caracteres")]
        public string Nombre { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "La descripción no puede exceder los 500 caracteres")]
        public string Descripcion { get; set; } = string.Empty;

        [Required(ErrorMessage = "El tipo de objeto es requerido")]
        public int TipoObjetoId { get; set; }

        public bool Activo { get; set; } = true;
    }
}
