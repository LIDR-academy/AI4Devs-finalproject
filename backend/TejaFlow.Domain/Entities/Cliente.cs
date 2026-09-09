namespace TejaFlow.Domain.Entities;

public sealed class Cliente
{
    public int IdCliente { get; set; }
    public string RazonSocial { get; set; } = string.Empty;
    public string RfcNit { get; set; } = string.Empty;
    public string TipoCliente { get; set; } = string.Empty;
    public string Telefono { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string DireccionEntrega { get; set; } = string.Empty;

    public ICollection<PedidoVenta> Pedidos { get; set; } = [];
}
