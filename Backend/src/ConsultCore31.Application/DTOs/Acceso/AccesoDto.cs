// En Application/DTOs/Acceso/AccesoDto.cs
namespace ConsultCore31.Application.DTOs.Acceso
{
    public class AccesoDto
    {
        public int PerfilId { get; set; }
        public int ObjetoId { get; set; }
        public bool Activo { get; set; }
        public string? Mensaje { get; set; }
        public string? PerfilNombre { get; set; }
        public string? ObjetoNombre { get; set; }
        public string? ObjetoTipoNombre { get; set; }
    }
}