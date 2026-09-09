using Microsoft.EntityFrameworkCore;
using TejaFlow.Application.Common.Interfaces;
using TejaFlow.Domain.Entities;
using TejaFlow.Domain.Enums;

namespace TejaFlow.Application.Breakage;

public sealed class BreakageService
{
    private readonly ITejaFlowDbContext _context;

    public BreakageService(ITejaFlowDbContext context)
    {
        _context = context;
    }

    public async Task<RegistrarMermaResult> RegistrarMermaAsync(
        RegistrarMermaRequest request,
        int idUsuario,
        CancellationToken cancellationToken = default)
    {
        if (request.IdLote <= 0)
        {
            return RegistrarMermaResult.Failed("El lote especificado no es valido.");
        }

        if (request.CantidadRotas <= 0)
        {
            return RegistrarMermaResult.Failed("La cantidad de piezas rotas debe ser mayor que cero.");
        }

        if (string.IsNullOrWhiteSpace(request.Motivo))
        {
            return RegistrarMermaResult.Failed("El motivo de la merma es obligatorio.");
        }

        await using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);

        var lote = await _context.LotesProduccion
            .Include(item => item.Teja)
            .FirstOrDefaultAsync(item => item.IdLote == request.IdLote, cancellationToken);

        if (lote is null)
        {
            return RegistrarMermaResult.Failed("El lote especificado no existe.");
        }

        if (lote.CantidadActual < request.CantidadRotas)
        {
            return RegistrarMermaResult.Failed("No puedes registrar una merma mayor al stock actual del lote.");
        }

        lote.DescontarStock(request.CantidadRotas);

        var now = DateTime.UtcNow;
        var merma = new MermaRotura
        {
            IdLote = request.IdLote,
            IdUsuario = idUsuario,
            CantidadRotas = request.CantidadRotas,
            Motivo = request.Motivo.Trim(),
            FechaRegistro = now
        };

        await _context.MermasRotura.AddAsync(merma, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        var stockGlobal = await _context.LotesProduccion
            .Where(item => item.IdTeja == lote.IdTeja)
            .SumAsync(item => item.CantidadActual, cancellationToken);

        if (lote.Teja is not null)
        {
            lote.Teja.ActualizarStockGlobal(stockGlobal);
        }

        var movimiento = new MovimientoInventario
        {
            IdLote = lote.IdLote,
            IdMerma = merma.IdMerma,
            IdUsuario = idUsuario,
            TipoMovimiento = TipoMovimientoInventario.Merma,
            Cantidad = -request.CantidadRotas,
            FechaMovimiento = now,
            Referencia = $"MERMA-{merma.IdMerma:D6}"
        };

        await _context.MovimientosInventario.AddAsync(movimiento, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return RegistrarMermaResult.Created(new MermaRegistradaDto(
            merma.IdMerma,
            lote.IdLote,
            lote.CodigoLote,
            lote.IdTeja,
            merma.CantidadRotas,
            lote.CantidadActual,
            stockGlobal,
            merma.Motivo,
            merma.FechaRegistro));
    }
}

