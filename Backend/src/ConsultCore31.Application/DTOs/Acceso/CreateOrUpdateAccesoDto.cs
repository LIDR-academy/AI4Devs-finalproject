using System.ComponentModel.DataAnnotations;

namespace ConsultCore31.Application.DTOs.Acceso
{
    /// <summary>
    /// DTO para crear o actualizar un acceso
    /// </summary>
    public class CreateOrUpdateAccesoDto
    {
        /// <summary>
        /// ID del perfil
        /// </summary>
        [Required(ErrorMessage = "El ID del perfil es requerido")]
        public int PerfilId { get; set; }

        /// <summary>
        /// ID del objeto
        /// </summary>
        [Required(ErrorMessage = "El ID del objeto es requerido")]
        public int ObjetoId { get; set; }

        /// <summary>
        /// Indica si el acceso está activo
        /// </summary>
        public bool Activo { get; set; } = true;
    }
}
