using System.Text.Json.Serialization;

namespace ConsultCore31.Application.DTOs.Acceso
{
    /// <summary>
    /// DTO que representa el resultado de la verificación de acceso
    /// </summary>
    public class VerificarAccesoDto
    {
        /// <summary>
        /// Indica si el acceso está permitido
        /// </summary>
        [JsonPropertyName("tieneAcceso")]
        public bool TieneAcceso { get; set; }

        /// <summary>
        /// Mensaje descriptivo del resultado de la verificación
        /// </summary>
        [JsonPropertyName("mensaje")]
        public string? Mensaje { get; set; }

        /// <summary>
        /// Fecha y hora de la verificación
        /// </summary>
        [JsonPropertyName("fechaVerificacion")]
        public DateTime FechaVerificacion { get; set; } = DateTime.UtcNow;
    }
}