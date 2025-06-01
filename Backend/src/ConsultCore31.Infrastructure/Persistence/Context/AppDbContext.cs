using ConsultCore31.Core.Entities;
using ConsultCore31.Core.Entities.Seguridad;

using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;

namespace ConsultCore31.Infrastructure.Persistence.Context
{
    public class AppDbContext : IdentityDbContext<Usuario, IdentityRole<int>, int>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        // Entidades del dominio
        public DbSet<Usuario> Usuarios { get; set; }

        public DbSet<Perfil> Perfiles { get; set; }
        public DbSet<Objeto> Objetos { get; set; }
        public DbSet<ObjetoTipo> ObjetosTipo { get; set; }
        public DbSet<Acceso> Accesos { get; set; }
        public DbSet<UsuarioToken> UsuarioTokens { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }
        public DbSet<Empleado> Empleados { get; set; }
        public DbSet<Puesto> Puestos { get; set; }

        // Entidades de catálogos
        public DbSet<EstadoProyecto> EstadosProyecto { get; set; }

        public DbSet<EstadoEtapa> EstadosEtapa { get; set; }
        public DbSet<EstadoTarea> EstadosTarea { get; set; }
        public DbSet<PrioridadTarea> PrioridadesTarea { get; set; }
        public DbSet<TipoProyecto> TiposProyecto { get; set; }
        public DbSet<TipoDocumento> TiposDocumento { get; set; }
        public DbSet<TipoKPI> TiposKPI { get; set; }
        public DbSet<FrecuenciaMedicion> FrecuenciasMedicion { get; set; }
        public DbSet<CategoriaGasto> CategoriasGasto { get; set; }
        public DbSet<EstadoAprobacion> EstadosAprobacion { get; set; }
        public DbSet<Moneda> Monedas { get; set; }
        public DbSet<TipoMovimientoViatico> TiposMovimientoViatico { get; set; }

        // Entidades principales
        public DbSet<Proyecto> Proyectos { get; set; }

        public DbSet<Cliente> Clientes { get; set; }
        public DbSet<ContactoCliente> ContactosCliente { get; set; }
        public DbSet<EtapaProyecto> EtapasProyecto { get; set; }
        public DbSet<Tarea> Tareas { get; set; }
        public DbSet<ComentarioTarea> ComentariosTarea { get; set; }
        public DbSet<ArchivoAdjunto> ArchivosAdjuntos { get; set; }
        public DbSet<Documento> Documentos { get; set; }
        public DbSet<VersionDocumento> VersionesDocumento { get; set; }
        public DbSet<CarpetaDocumento> CarpetasDocumento { get; set; }
        public DbSet<KPI> KPIs { get; set; }
        public DbSet<MedicionKPI> MedicionesKPI { get; set; }
        public DbSet<Gasto> Gastos { get; set; }
        public DbSet<AsignacionViatico> AsignacionesViatico { get; set; }
        public DbSet<MovimientoViatico> MovimientosViatico { get; set; }
        public DbSet<InformeSemanal> InformesSemanales { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configuración para la entidad Usuario
            modelBuilder.Entity<Usuario>(entity =>
            {
                // Mapear la tabla
                entity.ToTable("usuarios", "dbo");

                // Configuración de la clave primaria
                entity.HasKey(u => u.Id);

                // Mapear propiedades de Identity
                entity.Property(u => u.Id).HasColumnName("usuarioId");
                entity.Property(u => u.UserName).HasColumnName("usuarioNombre").HasMaxLength(256);
                entity.Property(u => u.NormalizedUserName).HasColumnName("normalizedUsuarioNombre").HasMaxLength(256);
                entity.Property(u => u.Email).HasColumnName("usuarioEmail").HasMaxLength(256);
                entity.Property(u => u.NormalizedEmail).HasColumnName("normalizedUsuarioEmail").HasMaxLength(256);
                entity.Property(u => u.EmailConfirmed).HasColumnName("emailConfirmado").HasDefaultValue(false);
                entity.Property(u => u.PasswordHash).HasColumnName("passwordHash");
                entity.Property(u => u.SecurityStamp).HasColumnName("securityStamp");
                entity.Property(u => u.ConcurrencyStamp).HasColumnName("concurrencyStamp");
                entity.Property(u => u.PhoneNumber).HasColumnName("usuarioMovil").HasMaxLength(15);
                entity.Property(u => u.PhoneNumberConfirmed).HasColumnName("phoneNumberConfirmed").HasDefaultValue(false);
                entity.Property(u => u.TwoFactorEnabled).HasColumnName("twoFactorEnabled").HasDefaultValue(false);
                entity.Property(u => u.LockoutEnd).HasColumnName("lockoutEnd");
                entity.Property(u => u.LockoutEnabled).HasColumnName("lockoutEnabled").HasDefaultValue(true);
                entity.Property(u => u.AccessFailedCount).HasColumnName("accessFailedCount").HasDefaultValue(0);

                // Propiedades personalizadas
                entity.Property(u => u.UsuarioApellidos)
                    .IsRequired()
                    .HasMaxLength(300)
                    .HasDefaultValue("");

                entity.Property(u => u.TokenUsuario)
                    .IsRequired(false);

                entity.Property(u => u.UsuarioActivo)
                    .IsRequired()
                    .HasDefaultValue(true);

                entity.Property(u => u.PerfilId)
                    .IsRequired()
                    .HasDefaultValue(1);

                entity.Property(u => u.EmpleadoId)
                    .IsRequired(false);

                entity.Property(u => u.ObjetoId)
                    .IsRequired()
                    .HasDefaultValue(2);

                entity.Property(u => u.UserName)
                    .IsRequired()
                    .HasMaxLength(200)
                    .HasDefaultValue("");

                entity.Property(u => u.UsuarioNumero)
                    .ValueGeneratedNever();

                // Relaciones
                entity.HasOne(u => u.Perfil)
                    .WithMany()
                    .HasForeignKey(u => u.PerfilId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(u => u.Empleado)
                    .WithMany()
                    .HasForeignKey(u => u.EmpleadoId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(u => u.Objeto)
                    .WithMany()
                    .HasForeignKey(u => u.ObjetoId)
                    .OnDelete(DeleteBehavior.Restrict);

                // Índices
                entity.HasIndex(u => u.NormalizedEmail).HasDatabaseName("EmailIndex");
                entity.HasIndex(u => u.NormalizedUserName).IsUnique().HasDatabaseName("UserNameIndex");
                entity.HasIndex(u => u.PerfilId).HasDatabaseName("IX_Usuarios_PerfilId");
                entity.HasIndex(u => u.EmpleadoId).HasDatabaseName("IX_Usuarios_EmpleadoId");
                entity.HasIndex(u => u.ObjetoId).HasDatabaseName("IX_Usuarios_ObjetoId");

                // Configuración de RefreshTokens
                entity.HasMany(u => u.RefreshTokens)
                    .WithOne(rt => rt.Usuario)
                    .HasForeignKey(rt => rt.UsuarioId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Configuración para la entidad RefreshToken
            modelBuilder.Entity<RefreshToken>(entity =>
            {
                entity.ToTable("refresh_tokens", "dbo");
                entity.HasKey(rt => rt.Id);

                // Configuración de propiedades
                entity.Property(rt => rt.Id).HasColumnName("refreshTokenId");
                entity.Property(rt => rt.Token)
                    .IsRequired()
                    .HasMaxLength(500)
                    .HasColumnName("refreshTokenToken");

                entity.Property(rt => rt.CreadoPorIp)
                    .IsRequired()
                    .HasMaxLength(50)
                    .HasColumnName("refreshTokenCreadoPorIp");

                entity.Property(rt => rt.RazonRevocacion)
                    .HasMaxLength(250)
                    .IsRequired(false)
                    .HasColumnName("refreshTokenRazonRevocacion");

                entity.Property(rt => rt.ReemplazadoPorToken)
                    .HasMaxLength(500)
                    .IsRequired(false)
                    .HasColumnName("refreshTokenReemplazadoPorToken");

                entity.Property(rt => rt.FechaExpiracion)
                    .IsRequired()
                    .HasColumnName("refreshTokenFechaExpiracion");

                entity.Property(rt => rt.FechaRevocacion)
                    .IsRequired(false)
                    .HasColumnName("refreshTokenFechaRevocacion");

                entity.Property(rt => rt.Revocado)
                    .IsRequired()
                    .HasDefaultValue(false)
                    .HasColumnName("refreshTokenRevocado");

                entity.Property(rt => rt.UsuarioId)
                    .IsRequired()
                    .HasColumnName("usuarioId");

                // Índices
                entity.HasIndex(rt => rt.Token).IsUnique();
                entity.HasIndex(rt => rt.UsuarioId);

                // Relación con Usuario
                entity.HasOne(rt => rt.Usuario)
                    .WithMany(u => u.RefreshTokens)
                    .HasForeignKey(rt => rt.UsuarioId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Configuración para la entidad Empleado
            modelBuilder.Entity<Empleado>(entity =>
            {
                entity.ToTable("empleados", "dbo");
                entity.HasKey(e => e.Id);

                // Configuración de propiedades con sus valores por defecto
                entity.Property(e => e.Id)
                    .HasColumnName("empleadoId")
                    .ValueGeneratedOnAdd(); // Auto-incremental según la migración existente

                entity.Property(e => e.Nombre)
                    .IsRequired()
                    .HasMaxLength(150)
                    .HasColumnName("empleadoNombre")
                    .HasDefaultValue("");

                entity.Property(e => e.Apellidos)
                    .IsRequired()
                    .HasMaxLength(300)
                    .HasColumnName("empleadoApellidos")
                    .HasDefaultValue("");

                entity.Property(e => e.FechaNacimiento)
                    .IsRequired(false)
                    .HasColumnName("empleadoFechaNacimiento");

                entity.Property(e => e.Email)
                    .IsRequired()
                    .HasMaxLength(150)
                    .HasColumnName("empleadoEmail");

                entity.Property(e => e.Telefono)
                    .IsRequired()
                    .HasMaxLength(15)
                    .HasColumnName("empleadoTelefono")
                    .HasDefaultValue("");

                entity.Property(e => e.Movil)
                    .IsRequired()
                    .HasMaxLength(15)
                    .HasColumnName("empleadoMovil")
                    .HasDefaultValue("");

                entity.Property(e => e.PuestoId)
                    .IsRequired(false)
                    .HasColumnName("puestoId");

                entity.Property(e => e.Activo)
                    .IsRequired()
                    .HasColumnName("empleadoActivo")
                    .HasDefaultValue(false);

                entity.Property(e => e.ObjetoId)
                    .IsRequired()
                    .HasColumnName("objetoId")
                    .HasDefaultValue(6);

                entity.Property(e => e.Genero)
                    .IsRequired()
                    .HasColumnName("empleadoGenero")
                    .HasDefaultValue(0);

                entity.Property(e => e.FechaIngreso)
                    .IsRequired(false)
                    .HasColumnName("empleadoFechaIngreso");

                entity.Property(e => e.TieneLicencia)
                    .IsRequired()
                    .HasColumnName("empleadoLicencia")
                    .HasDefaultValue(false);

                // Índices
                entity.HasIndex(e => e.PuestoId).HasDatabaseName("IX_Empleados_PuestoId");
                entity.HasIndex(e => e.ObjetoId).HasDatabaseName("IX_Empleados_ObjetoId");

                // Relaciones
                entity.HasOne(e => e.Puesto)
                    .WithMany(p => p.Empleados)
                    .HasForeignKey(e => e.PuestoId)
                    .OnDelete(DeleteBehavior.Restrict)
                    .HasConstraintName("FK_empleados_puestos");

                entity.HasOne(e => e.Objeto)
                    .WithMany()
                    .HasForeignKey(e => e.ObjetoId)
                    .OnDelete(DeleteBehavior.Restrict)
                    .HasConstraintName("FK_empleados_objetos");

                // Relación uno a uno con Usuario (no hay FK en la BD, se maneja desde Usuario)
                entity.HasOne(e => e.Usuario)
                    .WithOne(u => u.Empleado)
                    .HasForeignKey<Usuario>(u => u.EmpleadoId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Configuración para la entidad Perfil
            modelBuilder.Entity<Perfil>(entity =>
            {
                entity.ToTable("perfiles", "dbo");
                entity.HasKey(p => p.Id);

                // Configuración de propiedades
                entity.Property(p => p.Id).HasColumnName("perfilId");
                entity.Property(p => p.PerfilNombre)
                    .IsRequired()
                    .HasMaxLength(100)
                    .HasColumnName("perfilNombre");

                entity.Property(p => p.PerfilActivo)
                    .IsRequired()
                    .HasDefaultValue(true)
                    .HasColumnName("perfilActivo");

                entity.Property(p => p.ObjetoId)
                    .IsRequired()
                    .HasColumnName("objetoId");

                // Relación con Objeto
                entity.HasOne(p => p.Objeto)
                    .WithMany()
                    .HasForeignKey(p => p.ObjetoId)
                    .OnDelete(DeleteBehavior.Restrict);

                // Índices
                entity.HasIndex(p => p.PerfilNombre).IsUnique();
                entity.HasIndex(p => p.ObjetoId);
            });

            // Configuración para la entidad Objeto
            modelBuilder.Entity<Objeto>(entity =>
            {
                entity.ToTable("objetos", "dbo");
                entity.HasKey(o => o.Id);

                // Configuración de propiedades
                entity.Property(o => o.Id).HasColumnName("objetoId");
                entity.Property(o => o.ObjetoNombre)
                    .IsRequired()
                    .HasMaxLength(100)
                    .HasColumnName("objetoNombre");

                entity.Property(o => o.ObjetoActivo)
                    .IsRequired()
                    .HasDefaultValue(true)
                    .HasColumnName("objetoActivo");

                entity.Property(o => o.ObjetoTipoId)
                    .IsRequired()
                    .HasColumnName("objetoTipoId");

                // Relación con ObjetoTipo
                entity.HasOne(o => o.ObjetoTipo)
                    .WithMany(ot => ot.Objetos)
                    .HasForeignKey(o => o.ObjetoTipoId)
                    .OnDelete(DeleteBehavior.Restrict);

                // Índices
                entity.HasIndex(o => o.ObjetoNombre).IsUnique();
                entity.HasIndex(o => o.ObjetoTipoId);

                // Verificar si la propiedad MenuId existe antes de crear el índice
                var menuIdProperty = entity.Metadata.FindProperty("MenuId");
                if (menuIdProperty != null)
                {
                    entity.Property("MenuId").HasColumnName("menuId");
                    entity.HasIndex("MenuId").HasDatabaseName("IX_Objetos_MenuId");
                }
            });

            // Configuración para la entidad ObjetoTipo
            modelBuilder.Entity<ObjetoTipo>(entity =>
            {
                entity.ToTable("objetos_tipo", "dbo");
                entity.HasKey(ot => ot.Id);

                // Configuración de propiedades
                entity.Property(ot => ot.Id).HasColumnName("objetoTipoId");
                entity.Property(ot => ot.ObjetoTipoNombre)
                    .IsRequired()
                    .HasMaxLength(50)
                    .HasColumnName("objetoTipoNombre");

                entity.Property(ot => ot.ObjetoTipoActivo)
                    .IsRequired()
                    .HasDefaultValue(true)
                    .HasColumnName("objetoTipoActivo");

                // Índices
                entity.HasIndex(ot => ot.ObjetoTipoNombre).IsUnique();
            });

            // Configuración para la entidad Acceso
            modelBuilder.Entity<Acceso>(entity =>
            {
                entity.ToTable("accesos", "dbo");

                // Configuración de clave primaria compuesta
                entity.HasKey(a => new { a.PerfilId, a.ObjetoId });

                // Configuración de propiedades
                entity.Property(a => a.PerfilId).HasColumnName("perfilId");
                entity.Property(a => a.ObjetoId).HasColumnName("objetoId");
                entity.Property(a => a.Activo)
                    .IsRequired()
                    .HasDefaultValue(false)
                    .HasColumnName("accesoActivo");

                // Relaciones
                entity.HasOne(a => a.Perfil)
                    .WithMany(p => p.Accesos)
                    .HasForeignKey(a => a.PerfilId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(a => a.Objeto)
                    .WithMany()
                    .HasForeignKey(a => a.ObjetoId)
                    .OnDelete(DeleteBehavior.Cascade);

                // Índices
                entity.HasIndex(a => new { a.PerfilId, a.ObjetoId }).IsUnique();
            });

            // Configuración para la entidad UsuarioToken
            modelBuilder.Entity<UsuarioToken>(entity =>
            {
                entity.ToTable("usuario_tokens", "dbo");
                entity.HasKey(ut => ut.Id);

                // Configuración de propiedades
                entity.Property(ut => ut.Id).HasColumnName("usuarioTokenId");
                entity.Property(ut => ut.Token)
                    .IsRequired()
                    .HasMaxLength(500)
                    .HasColumnName("usuarioTokenToken");

                entity.Property(ut => ut.FechaExpiracion)
                    .IsRequired()
                    .HasColumnName("usuarioTokenFechaExpiracion");

                entity.Property(ut => ut.EstaActivo)
                    .IsRequired()
                    .HasDefaultValue(true)
                    .HasColumnName("usuarioTokenActivo");

                entity.Property(ut => ut.UsuarioId)
                    .IsRequired()
                    .HasColumnName("usuarioId");

                // Relación con Usuario
                entity.HasOne(ut => ut.User)
                    .WithMany()
                    .HasForeignKey(ut => ut.UsuarioId)
                    .OnDelete(DeleteBehavior.Cascade);

                // Índices
                entity.HasIndex(ut => ut.Token).IsUnique();
                entity.HasIndex(ut => ut.UsuarioId);
            });

            // Configuración para la entidad RefreshToken
            modelBuilder.Entity<RefreshToken>(entity =>
            {
                entity.HasKey(rt => rt.Id);
                entity.Property(rt => rt.Token).IsRequired();
                entity.Property(rt => rt.CreadoPorIp).IsRequired().HasMaxLength(50);
                entity.Property(rt => rt.FechaExpiracion).IsRequired();
                entity.Property(rt => rt.FechaRevocacion).IsRequired(false);
                entity.Property(rt => rt.RazonRevocacion).HasMaxLength(500);
                entity.Property(rt => rt.ReemplazadoPorToken).HasMaxLength(500);
                entity.Property(rt => rt.FechaCreacion).IsRequired();

                // Relación con Usuario
                entity.HasOne(rt => rt.Usuario)
                    .WithMany(u => u.RefreshTokens)
                    .HasForeignKey(rt => rt.UsuarioId)
                    .OnDelete(DeleteBehavior.Cascade);

                // Índices
                entity.HasIndex(rt => rt.Token).IsUnique();
                entity.HasIndex(rt => rt.UsuarioId);
            });

            // Aplicar configuraciones de entidades
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

            // Configuración para propiedades de cadena
            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                foreach (var property in entityType.GetProperties())
                {
                    if (property.ClrType == typeof(string) &&
                        property.Name != "Id" &&
                        !property.Name.EndsWith("Id") &&
                        !property.IsPrimaryKey())
                    {
                        property.SetIsUnicode(false);
                        property.SetMaxLength(256);
                    }
                }
            }

            // Configuración de índices para mejorar el rendimiento de búsquedas
            modelBuilder.Entity<Usuario>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<Perfil>()
                .HasIndex(p => p.PerfilNombre)
                .IsUnique();

            // Configuración de relaciones
            modelBuilder.Entity<Acceso>()
                .HasKey(a => new { a.PerfilId, a.ObjetoId });

            modelBuilder.Entity<Acceso>()
                .HasOne(a => a.Perfil)
                .WithMany(p => p.Accesos)
                .HasForeignKey(a => a.PerfilId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Acceso>()
                .HasOne(a => a.Objeto)
                .WithMany(o => o.Accesos)
                .HasForeignKey(a => a.ObjetoId)
                .OnDelete(DeleteBehavior.Restrict);

            // Deshabilitar la eliminación en cascada para todas las relaciones
            foreach (var relationship in modelBuilder.Model.GetEntityTypes()
                .SelectMany(e => e.GetForeignKeys())
                .Where(r => !r.IsOwnership && r.DeleteBehavior == DeleteBehavior.Cascade))
            {
                relationship.DeleteBehavior = DeleteBehavior.Restrict;
            }
        }

        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            var entries = ChangeTracker
                .Entries()
                .Where(e => e.Entity is Entity &&
                          (e.State == EntityState.Added || e.State == EntityState.Modified));

            var now = DateTime.UtcNow;

            foreach (var entry in entries)
            {
                var entity = (Entity)entry.Entity;

                if (entry.State == EntityState.Added)
                {
                    entity.CreatedAt = now;
                }

                entity.UpdatedAt = now;
            }

            return await base.SaveChangesAsync(cancellationToken);
        }
    }
}