using Microsoft.EntityFrameworkCore;
using TejaFlow.Application.Common.Interfaces;
using TejaFlow.Domain.Entities;
using TejaFlow.Domain.Enums;

namespace TejaFlow.Application.Logistics;

public sealed class LogisticsService
{
    private readonly ITejaFlowDbContext _context;

    public LogisticsService(ITejaFlowDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyCollection<PedidoPendienteEntregaDto>> GetPedidosPendientesAsync(
        CancellationToken cancellationToken = default)
    {
        var pedidos = await _context.PedidosVenta
            .AsNoTracking()
            .Include(pedido => pedido.Cliente)
            .Include(pedido => pedido.Detalles)
                .ThenInclude(detalle => detalle.Teja)
            .Where(pedido => pedido.EstadoPedido == EstadoPedido.Pagado || pedido.EstadoPedido == EstadoPedido.Parcial)
            .OrderBy(pedido => pedido.FechaPedido)
            .ToListAsync(cancellationToken);

        return pedidos
            .Select(pedido =>
            {
                var solicitada = pedido.Detalles.Sum(detalle => detalle.CantidadSolicitada);
                var despachada = pedido.Detalles.Sum(detalle => detalle.CantidadDespachada);

                return new PedidoPendienteEntregaDto(
                    pedido.IdPedido,
                    pedido.IdCliente,
                    pedido.Cliente?.RazonSocial ?? string.Empty,
                    pedido.EstadoPedido.ToString(),
                    pedido.Total,
                    solicitada,
                    despachada,
                    solicitada - despachada,
                    pedido.Detalles
                        .Where(detalle => detalle.CantidadPendiente > 0)
                        .Select(detalle => new DetallePendienteEntregaDto(
                            detalle.IdDetalle,
                            detalle.IdTeja,
                            detalle.Teja?.Modelo ?? string.Empty,
                            detalle.CantidadSolicitada,
                            detalle.CantidadDespachada,
                            detalle.CantidadPendiente))
                        .ToList());
            })
            .Where(pedido => pedido.CantidadPendiente > 0)
            .ToList();
    }

    public async Task<LogisticsResult> CrearDespachoAsync(
        CrearDespachoRequest request,
        int idUsuario,
        CancellationToken cancellationToken = default)
    {
        var validation = ValidateRequest(request);
        if (validation is not null)
        {
            return LogisticsResult.Failed(validation);
        }

        await using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);

        var pedido = await _context.PedidosVenta
            .Include(item => item.Detalles)
                .ThenInclude(detalle => detalle.Teja)
            .FirstOrDefaultAsync(item => item.IdPedido == request.IdPedido, cancellationToken);

        if (pedido is null)
        {
            return LogisticsResult.Failed("El pedido especificado no existe.");
        }

        if (pedido.EstadoPedido is not (EstadoPedido.Pagado or EstadoPedido.Parcial))
        {
            return LogisticsResult.Failed("Solo se pueden despachar pedidos pagados o parcialmente despachados.");
        }

        var despacho = new DespachoFlete
        {
            IdPedido = request.IdPedido,
            IdUsuario = idUsuario,
            TipoCamion = request.TipoCamion,
            PesoTotalCargaKg = request.PesoTotalCargaKg,
            PlacasVehiculo = request.PlacasVehiculo.Trim(),
            DireccionEntrega = request.DireccionEntrega.Trim(),
            IndicacionesDescarga = request.IndicacionesDescarga.Trim(),
            FechaSalida = DateTime.UtcNow,
            EstadoEntrega = EstadoEntrega.EnRuta
        };

        foreach (var remisionRequest in request.Remisiones)
        {
            var detalle = pedido.Detalles.FirstOrDefault(item => item.IdDetalle == remisionRequest.IdDetallePedido);
            if (detalle is null)
            {
                return LogisticsResult.Failed($"El detalle {remisionRequest.IdDetallePedido} no pertenece al pedido.");
            }

            try
            {
                detalle.RegistrarDespacho(remisionRequest.CantidadEnviada);
            }
            catch (InvalidOperationException exception)
            {
                return LogisticsResult.Failed(exception.Message);
            }

            despacho.Remisiones.Add(new RemisionParcial
            {
                IdDetallePedido = detalle.IdDetalle,
                CantidadEnviada = remisionRequest.CantidadEnviada,
                FechaRegistro = DateTime.UtcNow,
                FirmaRecibido = remisionRequest.FirmaRecibido?.Trim() ?? string.Empty
            });
        }

        pedido.ActualizarEstadoDespacho();
        await _context.DespachosFlete.AddAsync(despacho, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return LogisticsResult.Created(MapDespacho(despacho, pedido));
    }

    private static string? ValidateRequest(CrearDespachoRequest request)
    {
        if (request.IdPedido <= 0)
        {
            return "El pedido especificado no es valido.";
        }

        if (request.PesoTotalCargaKg <= 0)
        {
            return "El peso total de carga debe ser mayor que cero.";
        }

        if (string.IsNullOrWhiteSpace(request.PlacasVehiculo))
        {
            return "Las placas del vehiculo son obligatorias.";
        }

        if (string.IsNullOrWhiteSpace(request.DireccionEntrega))
        {
            return "La direccion de entrega es obligatoria.";
        }

        if (request.Remisiones.Count == 0)
        {
            return "El despacho debe incluir al menos una remision.";
        }

        if (request.Remisiones.Any(remision => remision.IdDetallePedido <= 0 || remision.CantidadEnviada <= 0))
        {
            return "Cada remision debe indicar un detalle valido y una cantidad mayor que cero.";
        }

        return null;
    }

    private static DespachoDto MapDespacho(DespachoFlete despacho, PedidoVenta pedido)
    {
        return new DespachoDto(
            despacho.IdDespacho,
            despacho.IdPedido,
            pedido.EstadoPedido.ToString(),
            despacho.TipoCamion.ToString(),
            despacho.PesoTotalCargaKg,
            despacho.PlacasVehiculo,
            despacho.DireccionEntrega,
            despacho.IndicacionesDescarga,
            despacho.FechaSalida,
            despacho.EstadoEntrega.ToString(),
            despacho.Remisiones.Select(remision =>
            {
                var detalle = pedido.Detalles.First(item => item.IdDetalle == remision.IdDetallePedido);

                return new RemisionDto(
                    remision.IdRemision,
                    remision.IdDetallePedido,
                    detalle.IdTeja,
                    detalle.Teja?.Modelo ?? string.Empty,
                    remision.CantidadEnviada,
                    detalle.CantidadSolicitada,
                    detalle.CantidadDespachada,
                    detalle.CantidadPendiente,
                    remision.FirmaRecibido,
                    remision.FechaRegistro);
            }).ToList());
    }
}
