using TejaFlow.Domain.Enums;

namespace TejaFlow.Domain.Entities;

public sealed class Usuario
{
    public int IdUsuario { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public RolUsuario Rol { get; set; }
    public bool Activo { get; set; } = true;

    public ICollection<PedidoVenta> Pedidos { get; set; } = [];
    public ICollection<MermaRotura> Mermas { get; set; } = [];
    public ICollection<DespachoFlete> Despachos { get; set; } = [];
    public ICollection<MovimientoInventario> MovimientosInventario { get; set; } = [];
}
