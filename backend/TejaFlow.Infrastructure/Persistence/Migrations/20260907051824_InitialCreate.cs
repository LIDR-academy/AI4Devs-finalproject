using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace TejaFlow.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CLIENTE",
                columns: table => new
                {
                    id_cliente = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    razon_social = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    rfc_nit = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    tipo_cliente = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    telefono = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    direccion_entrega = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CLIENTE", x => x.id_cliente);
                });

            migrationBuilder.CreateTable(
                name: "PRODUCTO_TEJA",
                columns: table => new
                {
                    id_teja = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    modelo = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    material = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    color = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    longitud_cm = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    ancho_cm = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    peso_kg = table.Column<decimal>(type: "decimal(4,2)", precision: 4, scale: 2, nullable: false),
                    precio_base = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    stock_global = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    stock_minimo_alerta = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PRODUCTO_TEJA", x => x.id_teja);
                    table.CheckConstraint("CK_PRODUCTO_TEJA_DIMENSIONES", "longitud_cm > 0 AND ancho_cm > 0 AND peso_kg > 0");
                    table.CheckConstraint("CK_PRODUCTO_TEJA_PRECIO", "precio_base >= 0");
                    table.CheckConstraint("CK_PRODUCTO_TEJA_STOCK_GLOBAL", "stock_global >= 0");
                });

            migrationBuilder.CreateTable(
                name: "USUARIO",
                columns: table => new
                {
                    id_usuario = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    nombre = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    password_hash = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    rol = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    activo = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    fecha_registro = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_USUARIO", x => x.id_usuario);
                    table.CheckConstraint("CK_USUARIO_ROL", "rol IN ('Admin', 'Vendedor', 'Almacenista', 'Logistica', 'Chofer')");
                });

            migrationBuilder.CreateTable(
                name: "LOTE_PRODUCCION",
                columns: table => new
                {
                    id_lote = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    id_teja = table.Column<int>(type: "int", nullable: false),
                    codigo_lote = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    fecha_entrada = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    cantidad_inicial = table.Column<int>(type: "int", nullable: false),
                    cantidad_actual = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LOTE_PRODUCCION", x => x.id_lote);
                    table.CheckConstraint("CK_LOTE_CANTIDAD_ACTUAL", "cantidad_actual >= 0");
                    table.CheckConstraint("CK_LOTE_CANTIDAD_INICIAL", "cantidad_inicial > 0");
                    table.ForeignKey(
                        name: "FK_LOTE_PRODUCCION_PRODUCTO_TEJA_id_teja",
                        column: x => x.id_teja,
                        principalTable: "PRODUCTO_TEJA",
                        principalColumn: "id_teja",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PEDIDO_VENTA",
                columns: table => new
                {
                    id_pedido = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    id_cliente = table.Column<int>(type: "int", nullable: false),
                    id_usuario = table.Column<int>(type: "int", nullable: false),
                    fecha_pedido = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    subtotal = table.Column<decimal>(type: "decimal(12,2)", precision: 12, scale: 2, nullable: false),
                    impuesto_iva = table.Column<decimal>(type: "decimal(12,2)", precision: 12, scale: 2, nullable: false),
                    costo_flete = table.Column<decimal>(type: "decimal(12,2)", precision: 12, scale: 2, nullable: false),
                    total = table.Column<decimal>(type: "decimal(12,2)", precision: 12, scale: 2, nullable: false),
                    estado_pedido = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PEDIDO_VENTA", x => x.id_pedido);
                    table.CheckConstraint("CK_PEDIDO_ESTADO", "estado_pedido IN ('Cotizacion', 'Pagado', 'Parcial', 'Despachado', 'Cancelado')");
                    table.CheckConstraint("CK_PEDIDO_IMPORTES", "subtotal >= 0 AND impuesto_iva >= 0 AND costo_flete >= 0 AND total >= 0");
                    table.ForeignKey(
                        name: "FK_PEDIDO_VENTA_CLIENTE_id_cliente",
                        column: x => x.id_cliente,
                        principalTable: "CLIENTE",
                        principalColumn: "id_cliente",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PEDIDO_VENTA_USUARIO_id_usuario",
                        column: x => x.id_usuario,
                        principalTable: "USUARIO",
                        principalColumn: "id_usuario",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "MERMA_ROTURA",
                columns: table => new
                {
                    id_merma = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    id_lote = table.Column<int>(type: "int", nullable: false),
                    id_usuario = table.Column<int>(type: "int", nullable: false),
                    cantidad_rotas = table.Column<int>(type: "int", nullable: false),
                    fecha_registro = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    motivo = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MERMA_ROTURA", x => x.id_merma);
                    table.CheckConstraint("CK_MERMA_CANTIDAD_ROTAS", "cantidad_rotas > 0");
                    table.ForeignKey(
                        name: "FK_MERMA_ROTURA_LOTE_PRODUCCION_id_lote",
                        column: x => x.id_lote,
                        principalTable: "LOTE_PRODUCCION",
                        principalColumn: "id_lote");
                    table.ForeignKey(
                        name: "FK_MERMA_ROTURA_USUARIO_id_usuario",
                        column: x => x.id_usuario,
                        principalTable: "USUARIO",
                        principalColumn: "id_usuario",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "DESPACHO_FLETE",
                columns: table => new
                {
                    id_despacho = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    id_pedido = table.Column<int>(type: "int", nullable: false),
                    id_usuario = table.Column<int>(type: "int", nullable: false),
                    tipo_camion = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    peso_total_carga_kg = table.Column<decimal>(type: "decimal(9,2)", precision: 9, scale: 2, nullable: false),
                    placas_vehiculo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    direccion_entrega = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    indicaciones_descarga = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    fecha_salida = table.Column<DateTime>(type: "datetime2", nullable: true),
                    fecha_entrega_real = table.Column<DateTime>(type: "datetime2", nullable: true),
                    estado_entrega = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DESPACHO_FLETE", x => x.id_despacho);
                    table.CheckConstraint("CK_DESPACHO_ESTADO", "estado_entrega IN ('EnRuta', 'Entregado', 'Cancelado')");
                    table.CheckConstraint("CK_DESPACHO_PESO", "peso_total_carga_kg > 0");
                    table.ForeignKey(
                        name: "FK_DESPACHO_FLETE_PEDIDO_VENTA_id_pedido",
                        column: x => x.id_pedido,
                        principalTable: "PEDIDO_VENTA",
                        principalColumn: "id_pedido",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DESPACHO_FLETE_USUARIO_id_usuario",
                        column: x => x.id_usuario,
                        principalTable: "USUARIO",
                        principalColumn: "id_usuario",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "DETALLE_PEDIDO",
                columns: table => new
                {
                    id_detalle = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    id_pedido = table.Column<int>(type: "int", nullable: false),
                    id_teja = table.Column<int>(type: "int", nullable: false),
                    cantidad_solicitada = table.Column<int>(type: "int", nullable: false),
                    cantidad_despachada = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    precio_unitario_aplicado = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    pendiente_techo_grados = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    metros_cuadrados_calculados = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DETALLE_PEDIDO", x => x.id_detalle);
                    table.CheckConstraint("CK_DETALLE_CALCULO_TECHO", "pendiente_techo_grados >= 0 AND pendiente_techo_grados <= 90 AND metros_cuadrados_calculados > 0");
                    table.CheckConstraint("CK_DETALLE_CANTIDADES", "cantidad_solicitada > 0 AND cantidad_despachada >= 0 AND cantidad_despachada <= cantidad_solicitada");
                    table.CheckConstraint("CK_DETALLE_PRECIO", "precio_unitario_aplicado >= 0");
                    table.ForeignKey(
                        name: "FK_DETALLE_PEDIDO_PEDIDO_VENTA_id_pedido",
                        column: x => x.id_pedido,
                        principalTable: "PEDIDO_VENTA",
                        principalColumn: "id_pedido",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DETALLE_PEDIDO_PRODUCTO_TEJA_id_teja",
                        column: x => x.id_teja,
                        principalTable: "PRODUCTO_TEJA",
                        principalColumn: "id_teja",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PAGO_VENTA",
                columns: table => new
                {
                    id_pago = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    id_pedido = table.Column<int>(type: "int", nullable: false),
                    metodo_pago = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    estado_pago = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    monto = table.Column<decimal>(type: "decimal(12,2)", precision: 12, scale: 2, nullable: false),
                    fecha_pago = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    referencia = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PAGO_VENTA", x => x.id_pago);
                    table.CheckConstraint("CK_PAGO_ESTADO", "estado_pago IN ('Pendiente', 'Pagado', 'Rechazado', 'Reembolsado')");
                    table.CheckConstraint("CK_PAGO_METODO", "metodo_pago IN ('Efectivo', 'TarjetaCredito', 'TarjetaDebito')");
                    table.CheckConstraint("CK_PAGO_MONTO", "monto > 0");
                    table.ForeignKey(
                        name: "FK_PAGO_VENTA_PEDIDO_VENTA_id_pedido",
                        column: x => x.id_pedido,
                        principalTable: "PEDIDO_VENTA",
                        principalColumn: "id_pedido",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "MOVIMIENTO_INVENTARIO",
                columns: table => new
                {
                    id_movimiento = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    id_lote = table.Column<int>(type: "int", nullable: false),
                    id_pedido = table.Column<int>(type: "int", nullable: true),
                    id_merma = table.Column<int>(type: "int", nullable: true),
                    id_usuario = table.Column<int>(type: "int", nullable: false),
                    tipo_movimiento = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    cantidad = table.Column<int>(type: "int", nullable: false),
                    fecha_movimiento = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    referencia = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MOVIMIENTO_INVENTARIO", x => x.id_movimiento);
                    table.CheckConstraint("CK_MOVIMIENTO_CANTIDAD", "cantidad <> 0");
                    table.CheckConstraint("CK_MOVIMIENTO_TIPO", "tipo_movimiento IN ('EntradaLote', 'Venta', 'Merma', 'DespachoParcial', 'AjusteManual')");
                    table.ForeignKey(
                        name: "FK_MOVIMIENTO_INVENTARIO_LOTE_PRODUCCION_id_lote",
                        column: x => x.id_lote,
                        principalTable: "LOTE_PRODUCCION",
                        principalColumn: "id_lote",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MOVIMIENTO_INVENTARIO_MERMA_ROTURA_id_merma",
                        column: x => x.id_merma,
                        principalTable: "MERMA_ROTURA",
                        principalColumn: "id_merma",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MOVIMIENTO_INVENTARIO_PEDIDO_VENTA_id_pedido",
                        column: x => x.id_pedido,
                        principalTable: "PEDIDO_VENTA",
                        principalColumn: "id_pedido",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MOVIMIENTO_INVENTARIO_USUARIO_id_usuario",
                        column: x => x.id_usuario,
                        principalTable: "USUARIO",
                        principalColumn: "id_usuario",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "REMISION_PARCIAL",
                columns: table => new
                {
                    id_remision = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    id_despacho = table.Column<int>(type: "int", nullable: false),
                    id_detalle_pedido = table.Column<int>(type: "int", nullable: false),
                    cantidad_entregada_lote = table.Column<int>(type: "int", nullable: false),
                    fecha_registro = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    firma_recibido = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_REMISION_PARCIAL", x => x.id_remision);
                    table.CheckConstraint("CK_REMISION_CANTIDAD", "cantidad_entregada_lote > 0");
                    table.ForeignKey(
                        name: "FK_REMISION_PARCIAL_DESPACHO_FLETE_id_despacho",
                        column: x => x.id_despacho,
                        principalTable: "DESPACHO_FLETE",
                        principalColumn: "id_despacho",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_REMISION_PARCIAL_DETALLE_PEDIDO_id_detalle_pedido",
                        column: x => x.id_detalle_pedido,
                        principalTable: "DETALLE_PEDIDO",
                        principalColumn: "id_detalle",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "CLIENTE",
                columns: new[] { "id_cliente", "direccion_entrega", "email", "razon_social", "rfc_nit", "telefono", "tipo_cliente" },
                values: new object[,]
                {
                    { 1, "Av. Tecnologico 1200, Chihuahua", "compras@constructoranorte.test", "Constructora Norte SA de CV", "CNO260101AB1", "6141000001", "Mayorista" },
                    { 2, "Carretera Aldama Km 8, Chihuahua", "ventas@techofirme.test", "Distribuidora Techo Firme", "DTF260101AB2", "6141000002", "Distribuidor" }
                });

            migrationBuilder.InsertData(
                table: "PRODUCTO_TEJA",
                columns: new[] { "id_teja", "ancho_cm", "color", "longitud_cm", "material", "modelo", "peso_kg", "precio_base", "stock_global", "stock_minimo_alerta" },
                values: new object[,]
                {
                    { 1, 25.00m, "Terracota", 42.00m, "Barro", "Colonial", 2.50m, 22.50m, 8000, 1500 },
                    { 2, 24.00m, "Grafito", 40.00m, "Concreto", "Francesa", 3.10m, 25.90m, 4500, 1000 },
                    { 3, 28.00m, "Arena", 44.00m, "Fibrocemento", "Plana Solar", 2.20m, 31.75m, 2200, 800 }
                });

            migrationBuilder.InsertData(
                table: "USUARIO",
                columns: new[] { "id_usuario", "activo", "email", "fecha_registro", "nombre", "password_hash", "rol" },
                values: new object[,]
                {
                    { 1, true, "admin@tejaflow.test", new DateTime(2026, 1, 10, 8, 0, 0, 0, DateTimeKind.Unspecified), "Ana Administradora", "seed-password-hash-admin", "Admin" },
                    { 2, true, "ventas@tejaflow.test", new DateTime(2026, 1, 10, 8, 5, 0, 0, DateTimeKind.Unspecified), "Victor Vendedor", "seed-password-hash-ventas", "Vendedor" },
                    { 3, true, "almacen@tejaflow.test", new DateTime(2026, 1, 10, 8, 10, 0, 0, DateTimeKind.Unspecified), "Alma Almacenista", "seed-password-hash-almacen", "Almacenista" }
                });

            migrationBuilder.InsertData(
                table: "LOTE_PRODUCCION",
                columns: new[] { "id_lote", "cantidad_actual", "cantidad_inicial", "codigo_lote", "fecha_entrada", "id_teja" },
                values: new object[,]
                {
                    { 1, 5000, 5000, "LOT-2026-B01", new DateTime(2026, 1, 15, 9, 0, 0, 0, DateTimeKind.Unspecified), 1 },
                    { 2, 3000, 3000, "LOT-2026-B02", new DateTime(2026, 1, 20, 9, 0, 0, 0, DateTimeKind.Unspecified), 1 },
                    { 3, 4500, 4500, "LOT-2026-C01", new DateTime(2026, 2, 1, 9, 0, 0, 0, DateTimeKind.Unspecified), 2 },
                    { 4, 2200, 2200, "LOT-2026-F01", new DateTime(2026, 2, 10, 9, 0, 0, 0, DateTimeKind.Unspecified), 3 }
                });

            migrationBuilder.InsertData(
                table: "PEDIDO_VENTA",
                columns: new[] { "id_pedido", "costo_flete", "estado_pedido", "fecha_pedido", "id_cliente", "id_usuario", "impuesto_iva", "subtotal", "total" },
                values: new object[] { 1, 2500.00m, "Pagado", new DateTime(2026, 2, 15, 10, 0, 0, 0, DateTimeKind.Unspecified), 1, 2, 6098.40m, 38115.00m, 46713.40m });

            migrationBuilder.InsertData(
                table: "DETALLE_PEDIDO",
                columns: new[] { "id_detalle", "cantidad_solicitada", "id_pedido", "id_teja", "metros_cuadrados_calculados", "pendiente_techo_grados", "precio_unitario_aplicado" },
                values: new object[] { 1, 1694, 1, 1, 138.56m, 30.00m, 22.50m });

            migrationBuilder.InsertData(
                table: "MERMA_ROTURA",
                columns: new[] { "id_merma", "cantidad_rotas", "fecha_registro", "id_lote", "id_usuario", "motivo" },
                values: new object[] { 1, 25, new DateTime(2026, 2, 12, 11, 30, 0, 0, DateTimeKind.Unspecified), 1, 3, "Rotura detectada durante acomodo en patio" });

            migrationBuilder.InsertData(
                table: "PAGO_VENTA",
                columns: new[] { "id_pago", "estado_pago", "fecha_pago", "id_pedido", "metodo_pago", "monto", "referencia" },
                values: new object[] { 1, "Pagado", new DateTime(2026, 2, 15, 10, 15, 0, 0, DateTimeKind.Unspecified), 1, "TarjetaDebito", 46713.40m, "SEED-PAGO-0001" });

            migrationBuilder.InsertData(
                table: "MOVIMIENTO_INVENTARIO",
                columns: new[] { "id_movimiento", "cantidad", "fecha_movimiento", "id_lote", "id_merma", "id_pedido", "id_usuario", "referencia", "tipo_movimiento" },
                values: new object[] { 1, -25, new DateTime(2026, 2, 12, 11, 30, 0, 0, DateTimeKind.Unspecified), 1, 1, null, 3, "MERMA-SEED-0001", "Merma" });

            migrationBuilder.CreateIndex(
                name: "IX_CLIENTE_email",
                table: "CLIENTE",
                column: "email");

            migrationBuilder.CreateIndex(
                name: "IX_CLIENTE_rfc_nit",
                table: "CLIENTE",
                column: "rfc_nit",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DESPACHO_FLETE_estado_entrega",
                table: "DESPACHO_FLETE",
                column: "estado_entrega");

            migrationBuilder.CreateIndex(
                name: "IX_DESPACHO_FLETE_id_pedido",
                table: "DESPACHO_FLETE",
                column: "id_pedido");

            migrationBuilder.CreateIndex(
                name: "IX_DESPACHO_FLETE_id_usuario",
                table: "DESPACHO_FLETE",
                column: "id_usuario");

            migrationBuilder.CreateIndex(
                name: "IX_DETALLE_PEDIDO_id_pedido",
                table: "DETALLE_PEDIDO",
                column: "id_pedido");

            migrationBuilder.CreateIndex(
                name: "IX_DETALLE_PEDIDO_id_teja",
                table: "DETALLE_PEDIDO",
                column: "id_teja");

            migrationBuilder.CreateIndex(
                name: "IX_LOTE_PRODUCCION_codigo_lote",
                table: "LOTE_PRODUCCION",
                column: "codigo_lote",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LOTE_TEJA_ACTUAL",
                table: "LOTE_PRODUCCION",
                columns: new[] { "id_teja", "cantidad_actual" });

            migrationBuilder.CreateIndex(
                name: "IX_MERMA_ROTURA_id_lote",
                table: "MERMA_ROTURA",
                column: "id_lote");

            migrationBuilder.CreateIndex(
                name: "IX_MERMA_ROTURA_id_usuario",
                table: "MERMA_ROTURA",
                column: "id_usuario");

            migrationBuilder.CreateIndex(
                name: "IX_MOVIMIENTO_INVENTARIO_id_lote_fecha_movimiento",
                table: "MOVIMIENTO_INVENTARIO",
                columns: new[] { "id_lote", "fecha_movimiento" });

            migrationBuilder.CreateIndex(
                name: "IX_MOVIMIENTO_INVENTARIO_id_merma",
                table: "MOVIMIENTO_INVENTARIO",
                column: "id_merma");

            migrationBuilder.CreateIndex(
                name: "IX_MOVIMIENTO_INVENTARIO_id_pedido",
                table: "MOVIMIENTO_INVENTARIO",
                column: "id_pedido");

            migrationBuilder.CreateIndex(
                name: "IX_MOVIMIENTO_INVENTARIO_id_usuario",
                table: "MOVIMIENTO_INVENTARIO",
                column: "id_usuario");

            migrationBuilder.CreateIndex(
                name: "IX_PAGO_VENTA_id_pedido",
                table: "PAGO_VENTA",
                column: "id_pedido");

            migrationBuilder.CreateIndex(
                name: "IX_PAGO_VENTA_metodo_pago",
                table: "PAGO_VENTA",
                column: "metodo_pago");

            migrationBuilder.CreateIndex(
                name: "IX_PEDIDO_VENTA_estado_pedido",
                table: "PEDIDO_VENTA",
                column: "estado_pedido");

            migrationBuilder.CreateIndex(
                name: "IX_PEDIDO_VENTA_fecha_pedido",
                table: "PEDIDO_VENTA",
                column: "fecha_pedido");

            migrationBuilder.CreateIndex(
                name: "IX_PEDIDO_VENTA_id_cliente",
                table: "PEDIDO_VENTA",
                column: "id_cliente");

            migrationBuilder.CreateIndex(
                name: "IX_PEDIDO_VENTA_id_usuario",
                table: "PEDIDO_VENTA",
                column: "id_usuario");

            migrationBuilder.CreateIndex(
                name: "IX_PRODUCTO_TEJA_material_color",
                table: "PRODUCTO_TEJA",
                columns: new[] { "material", "color" });

            migrationBuilder.CreateIndex(
                name: "IX_REMISION_PARCIAL_id_despacho",
                table: "REMISION_PARCIAL",
                column: "id_despacho");

            migrationBuilder.CreateIndex(
                name: "IX_REMISION_PARCIAL_id_detalle_pedido",
                table: "REMISION_PARCIAL",
                column: "id_detalle_pedido");

            migrationBuilder.CreateIndex(
                name: "IX_USUARIO_email",
                table: "USUARIO",
                column: "email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MOVIMIENTO_INVENTARIO");

            migrationBuilder.DropTable(
                name: "PAGO_VENTA");

            migrationBuilder.DropTable(
                name: "REMISION_PARCIAL");

            migrationBuilder.DropTable(
                name: "MERMA_ROTURA");

            migrationBuilder.DropTable(
                name: "DESPACHO_FLETE");

            migrationBuilder.DropTable(
                name: "DETALLE_PEDIDO");

            migrationBuilder.DropTable(
                name: "LOTE_PRODUCCION");

            migrationBuilder.DropTable(
                name: "PEDIDO_VENTA");

            migrationBuilder.DropTable(
                name: "PRODUCTO_TEJA");

            migrationBuilder.DropTable(
                name: "CLIENTE");

            migrationBuilder.DropTable(
                name: "USUARIO");
        }
    }
}
