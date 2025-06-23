using ConsultCore31.Core.Entities;
using ConsultCore31.Core.Entities.Seguridad;
using ConsultCore31.Infrastructure.Persistence.Configurations;

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

            modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

            modelBuilder.ApplyConfiguration(new UsuarioConfiguration());
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

                // Configuración de la propiedad MenuId
                entity.Property(o => o.MenuId)
                    .IsRequired(false)
                    .HasColumnName("menuId");

                // Relación con ObjetoTipo
                entity.HasOne(o => o.ObjetoTipo)
                    .WithMany(ot => ot.Objetos)
                    .HasForeignKey(o => o.ObjetoTipoId)
                    .OnDelete(DeleteBehavior.Restrict);

                // Relación con Menu - Configuración explícita para evitar MenuId1
                entity.HasOne(o => o.Menu)
                    .WithMany(m => m.Objetos)  // Asegúrate de que la clase Menu tenga esta propiedad de navegación
                    .HasForeignKey(o => o.MenuId)
                    .IsRequired(false)
                    .OnDelete(DeleteBehavior.Restrict);

                // Índices
                entity.HasIndex(o => o.ObjetoNombre).IsUnique();
                entity.HasIndex(o => o.ObjetoTipoId);
                entity.HasIndex(o => o.MenuId).HasDatabaseName("IX_Objetos_menuId");
            });

            modelBuilder.Entity<Objeto>().Ignore("MenuId1");

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

            // Configuración para la entidad CategoriaGasto
            modelBuilder.Entity<CategoriaGasto>(entity =>
            {
                entity.ToTable("CategoriasGasto", "dbo");
                entity.HasKey(c => c.Id);

                // Configuración de propiedades
                entity.Property(c => c.Id).HasColumnName("categoriaGastoId");
                entity.Property(c => c.Nombre)
                    .IsRequired()
                    .HasMaxLength(50)
                    .HasColumnName("categoriaGastoNombre");

                entity.Property(c => c.Descripcion)
                    .HasMaxLength(200)
                    .HasColumnName("categoriaGastoDescripcion");

                entity.Property(c => c.EsEstandar)
                    .IsRequired()
                    .HasColumnName("categoriaGastoEsEstandar")
                    .HasDefaultValue(true);

                entity.Property(c => c.RequiereComprobante)
                    .IsRequired()
                    .HasColumnName("categoriaGastoRequiereComprobante")
                    .HasDefaultValue(true);

                // Configuración específica para la propiedad decimal LimiteMaximo
                entity.Property(c => c.LimiteMaximo)
                    .HasColumnName("categoriaGastoLimiteMaximo")
                    .HasPrecision(18, 2); // Especificamos precisión y escala

                entity.Property(c => c.Activa)
                    .IsRequired()
                    .HasColumnName("categoriaGastoActiva")
                    .HasDefaultValue(true);
            });

            // Configuración para la entidad Gasto
            modelBuilder.Entity<Gasto>(entity =>
            {
                entity.ToTable("Gastos", "dbo");
                entity.HasKey(g => g.Id);

                // Configuración de propiedades
                entity.Property(g => g.Id).HasColumnName("gastoId");
                entity.Property(g => g.Concepto)
                    .IsRequired()
                    .HasMaxLength(200)
                    .HasColumnName("gastoConcepto");

                // Configuración específica para propiedades decimales
                entity.Property(g => g.Monto)
                    .IsRequired()
                    .HasColumnName("gastoMonto")
                    .HasPrecision(18, 2); // Especificamos precisión y escala

                entity.Property(g => g.TipoCambio)
                    .HasColumnName("gastoTipoCambio")
                    .HasPrecision(18, 6); // Mayor precisión para tipos de cambio

                // Resto de propiedades
                entity.Property(g => g.Fecha)
                    .IsRequired()
                    .HasColumnName("gastoFecha");

                entity.Property(g => g.ProyectoId)
                    .IsRequired()
                    .HasColumnName("proyectoId");

                entity.Property(g => g.CategoriaGastoId)
                    .IsRequired()
                    .HasColumnName("categoriaGastoId");

                entity.Property(g => g.EmpleadoId)
                    .IsRequired()
                    .HasColumnName("empleadoId");

                entity.Property(g => g.MonedaId)
                    .IsRequired()
                    .HasColumnName("monedaId");

                entity.Property(g => g.NumeroFactura)
                    .HasMaxLength(50)
                    .HasColumnName("gastoNumeroFactura");

                entity.Property(g => g.Proveedor)
                    .HasMaxLength(100)
                    .HasColumnName("gastoProveedor");

                entity.Property(g => g.ProveedorRFC)
                    .HasMaxLength(13)
                    .HasColumnName("gastoProveedorRFC");

                entity.Property(g => g.RutaComprobante)
                    .HasMaxLength(500)
                    .HasColumnName("gastoRutaComprobante");

                entity.Property(g => g.EstadoAprobacionId)
                    .IsRequired()
                    .HasColumnName("estadoAprobacionId");

                entity.Property(g => g.AprobadoPorId)
                    .HasColumnName("aprobadoPorId");

                entity.Property(g => g.FechaAprobacion)
                    .HasColumnName("gastoFechaAprobacion");

                entity.Property(g => g.Comentarios)
                    .HasMaxLength(500)
                    .HasColumnName("gastoComentarios");

                entity.Property(g => g.EsReembolsable)
                    .IsRequired()
                    .HasColumnName("gastoEsReembolsable");

                entity.Property(g => g.Activo)
                    .IsRequired()
                    .HasColumnName("gastoActivo")
                    .HasDefaultValue(true);

                // Relaciones
                entity.HasOne(g => g.Proyecto)
                    .WithMany()
                    .HasForeignKey(g => g.ProyectoId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(g => g.CategoriaGasto)
                    .WithMany()
                    .HasForeignKey(g => g.CategoriaGastoId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(g => g.Empleado)
                    .WithMany()
                    .HasForeignKey(g => g.EmpleadoId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(g => g.Moneda)
                    .WithMany()
                    .HasForeignKey(g => g.MonedaId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(g => g.EstadoAprobacion)
                    .WithMany()
                    .HasForeignKey(g => g.EstadoAprobacionId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Configuración para la entidad AsignacionViatico
            modelBuilder.Entity<AsignacionViatico>(entity =>
            {
                entity.ToTable("AsignacionesViatico", "dbo");
                entity.HasKey(av => av.Id);

                // Configuración de propiedades
                entity.Property(av => av.Id).HasColumnName("asignacionViaticoId");
                entity.Property(av => av.Concepto)
                    .IsRequired()
                    .HasMaxLength(200)
                    .HasColumnName("asignacionViaticoConcepto");

                // Configuración específica para propiedades decimales
                entity.Property(av => av.MontoTotal)
                    .IsRequired()
                    .HasColumnName("asignacionViaticoMontoTotal")
                    .HasPrecision(18, 2); // Especificamos precisión y escala

                entity.Property(av => av.SaldoPendiente)
                    .HasColumnName("asignacionViaticoSaldoPendiente")
                    .HasPrecision(18, 2); // Especificamos precisión y escala

                // Resto de propiedades
                entity.Property(av => av.ProyectoId)
                    .IsRequired()
                    .HasColumnName("proyectoId");

                entity.Property(av => av.EmpleadoId)
                    .IsRequired()
                    .HasColumnName("empleadoId");

                entity.Property(av => av.MonedaId)
                    .IsRequired()
                    .HasColumnName("monedaId");

                entity.Property(av => av.FechaInicio)
                    .IsRequired()
                    .HasColumnName("asignacionViaticoFechaInicio");

                entity.Property(av => av.FechaFin)
                    .IsRequired()
                    .HasColumnName("asignacionViaticoFechaFin");

                entity.Property(av => av.Destino)
                    .HasMaxLength(100)
                    .HasColumnName("asignacionViaticoDestino");

                entity.Property(av => av.PropositoViaje)
                    .HasMaxLength(500)
                    .HasColumnName("asignacionViaticoPropositoViaje");

                entity.Property(av => av.EstadoAprobacionId)
                    .IsRequired()
                    .HasColumnName("estadoAprobacionId");

                entity.Property(av => av.AprobadoPorId)
                    .HasColumnName("aprobadoPorId");

                entity.Property(av => av.FechaAprobacion)
                    .HasColumnName("asignacionViaticoFechaAprobacion");

                entity.Property(av => av.EsLiquidada)
                    .IsRequired()
                    .HasColumnName("asignacionViaticoEsLiquidada");

                entity.Property(av => av.FechaLiquidacion)
                    .HasColumnName("asignacionViaticoFechaLiquidacion");

                entity.Property(av => av.Comentarios)
                    .HasMaxLength(500)
                    .HasColumnName("asignacionViaticoComentarios");

                // Relaciones
                entity.HasOne(av => av.Proyecto)
                    .WithMany()
                    .HasForeignKey(av => av.ProyectoId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(av => av.Empleado)
                    .WithMany()
                    .HasForeignKey(av => av.EmpleadoId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(av => av.Moneda)
                    .WithMany()
                    .HasForeignKey(av => av.MonedaId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(av => av.EstadoAprobacion)
                    .WithMany()
                    .HasForeignKey(av => av.EstadoAprobacionId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Configuración para la entidad MovimientoViatico
            modelBuilder.Entity<MovimientoViatico>(entity =>
            {
                entity.ToTable("MovimientosViatico", "dbo");
                entity.HasKey(mv => mv.Id);

                // Configuración de propiedades
                entity.Property(mv => mv.Id).HasColumnName("movimientoViaticoId");
                entity.Property(mv => mv.Concepto)
                    .IsRequired()
                    .HasMaxLength(200)
                    .HasColumnName("movimientoViaticoConcepto");

                // Configuración específica para propiedades decimales
                entity.Property(mv => mv.Monto)
                    .IsRequired()
                    .HasColumnName("movimientoViaticoMonto")
                    .HasPrecision(18, 2); // Especificamos precisión y escala

                // Resto de propiedades
                entity.Property(mv => mv.AsignacionViaticoId)
                    .IsRequired()
                    .HasColumnName("asignacionViaticoId");

                entity.Property(mv => mv.TipoMovimientoViaticoId)
                    .IsRequired()
                    .HasColumnName("tipoMovimientoViaticoId");

                entity.Property(mv => mv.Fecha)
                    .IsRequired()
                    .HasColumnName("movimientoViaticoFecha");

                entity.Property(mv => mv.CategoriaGastoId)
                    .HasColumnName("categoriaGastoId");

                entity.Property(mv => mv.RutaComprobante)
                    .HasMaxLength(500)
                    .HasColumnName("movimientoViaticoRutaComprobante");

                entity.Property(mv => mv.RegistradoPorId)
                    .IsRequired()
                    .HasColumnName("registradoPorId");

                entity.Property(mv => mv.FechaRegistro)
                    .IsRequired()
                    .HasColumnName("movimientoViaticoFechaRegistro");

                entity.Property(mv => mv.Comentarios)
                    .HasMaxLength(500)
                    .HasColumnName("movimientoViaticoComentarios");

                entity.Property(mv => mv.Activo)
                    .IsRequired()
                    .HasColumnName("movimientoViaticoActivo")
                    .HasDefaultValue(true);

                // Relaciones
                entity.HasOne(mv => mv.AsignacionViatico)
                    .WithMany()
                    .HasForeignKey(mv => mv.AsignacionViaticoId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(mv => mv.TipoMovimientoViatico)
                    .WithMany()
                    .HasForeignKey(mv => mv.TipoMovimientoViaticoId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(mv => mv.CategoriaGasto)
                    .WithMany()
                    .HasForeignKey(mv => mv.CategoriaGastoId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(mv => mv.RegistradoPor)
                    .WithMany()
                    .HasForeignKey(mv => mv.RegistradoPorId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Configuración para la entidad Moneda
            modelBuilder.Entity<Moneda>(entity =>
            {
                entity.ToTable("Monedas", "dbo");
                entity.HasKey(m => m.Id);

                // Configuración de propiedades
                entity.Property(m => m.Id).HasColumnName("monedaId");
                entity.Property(m => m.Codigo)
                    .IsRequired()
                    .HasMaxLength(3)
                    .HasColumnName("monedaCodigo");

                entity.Property(m => m.Nombre)
                    .IsRequired()
                    .HasMaxLength(50)
                    .HasColumnName("monedaNombre");

                entity.Property(m => m.Simbolo)
                    .HasMaxLength(5)
                    .HasColumnName("monedaSimbolo");

                // Configuración específica para propiedades decimales
                entity.Property(m => m.TasaCambio)
                    .IsRequired()
                    .HasColumnName("monedaTasaCambio")
                    .HasPrecision(18, 6); // Mayor precisión para tasas de cambio

                entity.Property(m => m.FechaActualizacion)
                    .HasColumnName("monedaFechaActualizacion");

                entity.Property(m => m.EsPredeterminada)
                    .IsRequired()
                    .HasColumnName("monedaEsPredeterminada");

                entity.Property(m => m.Activa)
                    .IsRequired()
                    .HasColumnName("monedaActiva")
                    .HasDefaultValue(true);

                // Índices
                entity.HasIndex(m => m.Codigo).IsUnique();
            });

            // Configuración para la entidad TipoDocumento
            modelBuilder.Entity<TipoDocumento>(entity =>
            {
                entity.ToTable("TiposDocumento", "dbo");
                entity.HasKey(td => td.Id);

                // Configuración específica para propiedades decimales
                entity.Property(td => td.TamanoMaximoMB)
                    .HasColumnName("tipoDocumentoTamanoMaximoMB")
                    .HasPrecision(10, 2); // Precisión adecuada para tamaños en MB
            });

            // Configuración para la entidad Proyecto
            modelBuilder.Entity<Proyecto>(entity =>
            {
                // Configuración específica para propiedades decimales
                entity.Property(p => p.Presupuesto)
                    .HasColumnName("proyectoPresupuesto")
                    .HasPrecision(18, 2);

                entity.Property(p => p.RetornoInversionObjetivo)
                    .HasColumnName("proyectoRetornoInversionObjetivo")
                    .HasPrecision(10, 2);

                entity.Property(p => p.PorcentajeAvance)
                    .HasColumnName("proyectoPorcentajeAvance")
                    .HasPrecision(5, 2); // Precisión para porcentajes
            });

            // Configuración para la entidad KPI
            modelBuilder.Entity<KPI>(entity =>
            {
                // Configuración específica para propiedades decimales
                entity.Property(k => k.ValorBase)
                    .HasColumnName("kpiValorBase")
                    .HasPrecision(18, 4); // Mayor precisión para valores de KPI

                entity.Property(k => k.ValorObjetivo)
                    .HasColumnName("kpiValorObjetivo")
                    .HasPrecision(18, 4);

                entity.Property(k => k.ValorMinimo)
                    .HasColumnName("kpiValorMinimo")
                    .HasPrecision(18, 4);
            });

            // Configuración para la entidad MedicionKPI
            modelBuilder.Entity<MedicionKPI>(entity =>
            {
                // Configuración específica para propiedades decimales
                entity.Property(m => m.Valor)
                    .IsRequired()
                    .HasColumnName("medicionKPIValor")
                    .HasPrecision(18, 4); // Mayor precisión para valores de mediciones
            });

            // Configuración para la entidad EtapaProyecto
            modelBuilder.Entity<EtapaProyecto>(entity =>
            {
                // Configuración específica para propiedades decimales
                entity.Property(ep => ep.PorcentajeCompletado)
                    .HasColumnName("etapaProyectoPorcentajeCompletado")
                    .HasPrecision(5, 2); // Precisión para porcentajes
            });

            // Configuración para la entidad InformeSemanal
            modelBuilder.Entity<InformeSemanal>(entity =>
            {
                // Configuración específica para propiedades decimales
                entity.Property(i => i.PorcentajeAvance)
                    .IsRequired()
                    .HasColumnName("informeSemanalPorcentajeAvance")
                    .HasPrecision(5, 2); // Precisión para porcentajes
            });

            // Configuración para la entidad Tarea
            modelBuilder.Entity<Tarea>(entity =>
            {
                // Configuración específica para propiedades decimales
                entity.Property(t => t.PorcentajeCompletado)
                    .HasColumnName("tareaPorcentajeCompletado")
                    .HasPrecision(5, 2); // Precisión para porcentajes
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

            // Configuraciones explícitas para evitar FK en shadow state
            modelBuilder.Entity<Gasto>()
                .HasOne(g => g.Proyecto)
                .WithMany(p => p.Gastos)
                .HasForeignKey(g => g.ProyectoId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Gasto>()
                .HasOne(g => g.CategoriaGasto)
                .WithMany(c => c.Gastos)
                .HasForeignKey(g => g.CategoriaGastoId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Gasto>()
                .HasOne(g => g.EstadoAprobacion)
                .WithMany(e => e.Gastos)
                .HasForeignKey(g => g.EstadoAprobacionId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Gasto>()
                .HasOne(g => g.Moneda)
                .WithMany(m => m.Gastos)
                .HasForeignKey(g => g.MonedaId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configuración para evitar ProyectoId1 en shadow state
            modelBuilder.Entity<AsignacionViatico>()
                .HasOne(a => a.Proyecto)
                .WithMany(p => p.AsignacionesViatico)
                .HasForeignKey(a => a.ProyectoId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<AsignacionViatico>()
                .HasOne(a => a.Empleado)
                .WithMany()
                .HasForeignKey(a => a.EmpleadoId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<AsignacionViatico>()
                .HasOne(a => a.Moneda)
                .WithMany()
                .HasForeignKey(a => a.MonedaId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configuración para evitar AsignacionViaticoId1 en shadow state
            modelBuilder.Entity<MovimientoViatico>()
                .HasOne(m => m.AsignacionViatico)
                .WithMany(a => a.MovimientosViatico)
                .HasForeignKey(m => m.AsignacionViaticoId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<MovimientoViatico>()
                .HasOne(m => m.TipoMovimientoViatico)
                .WithMany(t => t.MovimientosViatico)
                .HasForeignKey(m => m.TipoMovimientoViaticoId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configuración para CategoriaGastoId opcional en MovimientoViatico
            modelBuilder.Entity<MovimientoViatico>()
                .HasOne(m => m.CategoriaGasto)
                .WithMany()
                .HasForeignKey(m => m.CategoriaGastoId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.Restrict);

            // La configuración de la entidad Usuario ahora se maneja en UsuarioConfiguration.cs

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