using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TejaFlow.Domain.Entities;
using TejaFlow.Domain.Enums;

namespace TejaFlow.Infrastructure.Persistence.Configurations;

public sealed class UsuarioConfiguration : IEntityTypeConfiguration<Usuario>
{
    public void Configure(EntityTypeBuilder<Usuario> builder)
    {
        builder.ToTable("USUARIO", table =>
        {
            table.HasCheckConstraint("CK_USUARIO_ROL", "rol IN ('Admin', 'Vendedor', 'Almacenista', 'Logistica', 'Chofer')");
        });
        builder.HasKey(usuario => usuario.IdUsuario);

        builder.Property(usuario => usuario.IdUsuario).HasColumnName("id_usuario");
        builder.Property(usuario => usuario.Nombre).HasColumnName("nombre").HasMaxLength(100).IsRequired();
        builder.Property(usuario => usuario.Email).HasColumnName("email").HasMaxLength(100).IsRequired();
        builder.Property(usuario => usuario.PasswordHash).HasColumnName("password_hash").HasMaxLength(255).IsRequired();
        builder.Property(usuario => usuario.Rol).HasColumnName("rol").HasConversion<string>().HasMaxLength(30).IsRequired();
        builder.Property(usuario => usuario.Activo).HasColumnName("activo").HasDefaultValue(true).IsRequired();

        builder.Property<DateTime>("FechaRegistro")
            .HasColumnName("fecha_registro")
            .HasDefaultValueSql("GETDATE()")
            .IsRequired();

        builder.HasIndex(usuario => usuario.Email).IsUnique();

        builder.HasData(
            new
            {
                IdUsuario = 1,
                Nombre = "Ana Administradora",
                Email = "admin@tejaflow.test",
                PasswordHash = "PBKDF2-SHA256$100000$zfeigbgFTJozOJ7WV/Hw+Q==$awaiPqs78CH7ysnMdBhEx6GRaPrHPPzogMoFzF/vODw=",
                Rol = RolUsuario.Admin,
                Activo = true,
                FechaRegistro = new DateTime(2026, 1, 10, 8, 0, 0)
            },
            new
            {
                IdUsuario = 2,
                Nombre = "Victor Vendedor",
                Email = "ventas@tejaflow.test",
                PasswordHash = "PBKDF2-SHA256$100000$ajuJ9F8iqrjuhO1kLD1efw==$zvbre3ErVZg7zL2E9hlasj8WUp2a7aG6HExc/lBUWVY=",
                Rol = RolUsuario.Vendedor,
                Activo = true,
                FechaRegistro = new DateTime(2026, 1, 10, 8, 5, 0)
            },
            new
            {
                IdUsuario = 3,
                Nombre = "Alma Almacenista",
                Email = "almacen@tejaflow.test",
                PasswordHash = "PBKDF2-SHA256$100000$Buh8I9hywZ5DPPdVbSq5/g==$zbcAqrzZO5ksbWsepOM9II6q12vraC8dcTYogE+DI1o=",
                Rol = RolUsuario.Almacenista,
                Activo = true,
                FechaRegistro = new DateTime(2026, 1, 10, 8, 10, 0)
            });
    }
}
