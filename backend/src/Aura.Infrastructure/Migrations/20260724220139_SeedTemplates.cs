using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Aura.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SeedTemplates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "templates",
                columns: new[] { "id", "category", "created_at", "description", "is_premium", "layout_json", "name", "preview_url" },
                values: new object[,]
                {
                    { new Guid("11111111-1111-1111-1111-111111111111"), "wedding", new DateTimeOffset(new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), "A classic and elegant design with floral touches.", false, "{}", "Elegant Rose", "/assets/templates/classic.jpg" },
                    { new Guid("22222222-2222-2222-2222-222222222222"), "wedding", new DateTimeOffset(new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), "Clean lines and ample whitespace for a contemporary look.", false, "{}", "Modern Minimalist", "/assets/templates/modern.jpg" },
                    { new Guid("33333333-3333-3333-3333-333333333333"), "wedding", new DateTimeOffset(new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), "Warm and inviting, perfect for country or outdoor weddings.", false, "{}", "Rustic Charm", "/assets/templates/rustic.jpg" },
                    { new Guid("44444444-4444-4444-4444-444444444444"), "wedding", new DateTimeOffset(new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), "Luxurious gold accents for a premium feel.", true, "{}", "Premium Gold", "/assets/templates/premium.jpg" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "templates",
                keyColumn: "id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"));

            migrationBuilder.DeleteData(
                table: "templates",
                keyColumn: "id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"));

            migrationBuilder.DeleteData(
                table: "templates",
                keyColumn: "id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"));

            migrationBuilder.DeleteData(
                table: "templates",
                keyColumn: "id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"));
        }
    }
}
