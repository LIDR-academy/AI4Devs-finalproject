// UsuarioTokenRepository.cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Ardalis.Specification;
using Ardalis.Specification.EntityFrameworkCore;
using ConsultCore31.Core.Entities;
using ConsultCore31.Core.Interfaces;
using ConsultCore31.Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace ConsultCore31.Infrastructure.Persistence.Repositories
{
    public class UsuarioTokenRepository : RepositoryBase<UsuarioToken>, IUsuarioTokenRepository
    {
        private readonly AppDbContext _context;

        public UsuarioTokenRepository(AppDbContext context) : base(context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        // Implementación de métodos específicos de IUsuarioTokenRepository
        public async Task<UsuarioToken> GetByTokenAsync(Guid token)
        {
            return await _context.UsuarioTokens
                .Include(ut => ut.User)
                .FirstOrDefaultAsync(ut => ut.Token == token);
        }

        public async Task InvalidateUserTokensAsync(int usuarioId, string ipAddress, string? motivo = null)
        {
            if (usuarioId <= 0)
                throw new ArgumentException("El ID de usuario debe ser mayor que cero.", nameof(usuarioId));

            if (string.IsNullOrEmpty(ipAddress))
                throw new ArgumentException("La dirección IP no puede estar vacía.", nameof(ipAddress));

            var tokens = await _context.UsuarioTokens
                .Where(ut => ut.UsuarioId == usuarioId && !ut.TokenUsado)
                .ToListAsync();

            foreach (var token in tokens)
            {
                token.TokenUsado = true;
                token.FechaUso = DateTime.UtcNow;
                token.IpUso = ipAddress;
                token.MotivoUso = motivo;
            }

            await _context.SaveChangesAsync();
        }

        /// <inheritdoc />
        public async Task<IEnumerable<UsuarioToken>> GetActiveTokensByUsuarioIdAsync(int usuarioId)
        {
            if (usuarioId <= 0)
                throw new ArgumentException("El ID de usuario debe ser mayor que cero.", nameof(usuarioId));

            return await _context.UsuarioTokens
                .Include(ut => ut.User)
                .Where(ut => ut.UsuarioId == usuarioId && !ut.TokenUsado && ut.FechaExpiracion > DateTime.UtcNow)
                .ToListAsync();
        }

        public async Task MarkAsUsedAsync(Guid token, string ipAddress, string? motivo = null)
        {
            if (string.IsNullOrEmpty(ipAddress))
                throw new ArgumentException("La dirección IP no puede estar vacía.", nameof(ipAddress));

            var tokenEntity = await GetByTokenAsync(token);
            if (tokenEntity == null)
            {
                throw new InvalidOperationException($"No se encontró un token con el valor {token}");
            }

            tokenEntity.TokenUsado = true;
            tokenEntity.FechaUso = DateTime.UtcNow;
            
            // Aseguramos que ipAddress no sea nulo
            tokenEntity.IpUso = ipAddress ?? throw new ArgumentNullException(nameof(ipAddress));
            
            // Motivo es opcional, por lo que puede ser nulo
            tokenEntity.MotivoUso = motivo;
            
            // Actualizamos la fecha de modificación
            tokenEntity.FechaModificacion = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
        }

        public async Task<bool> IsValidTokenAsync(Guid token)
        {
            var tokenEntity = await GetByTokenAsync(token);
            return tokenEntity != null && !tokenEntity.TokenUsado && tokenEntity.FechaExpiracion > DateTime.UtcNow;
        }

        public async Task<int> RemoveExpiredTokensAsync()
        {
            try
            {
                var expiredTokens = await _context.UsuarioTokens
                    .Where(ut => ut.FechaExpiracion < DateTime.UtcNow)
                    .ToListAsync();

                if (!expiredTokens.Any())
                {
                    return 0;
                }

                _context.UsuarioTokens.RemoveRange(expiredTokens);
                return await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                // Log the error here if you have a logger injected
                throw new ApplicationException("Error al eliminar tokens expirados", ex);
            }
        }
    }
}