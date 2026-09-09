using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TejaFlow.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class SeedUserPasswordHashes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "USUARIO",
                keyColumn: "id_usuario",
                keyValue: 1,
                column: "password_hash",
                value: "PBKDF2-SHA256$100000$zfeigbgFTJozOJ7WV/Hw+Q==$awaiPqs78CH7ysnMdBhEx6GRaPrHPPzogMoFzF/vODw=");

            migrationBuilder.UpdateData(
                table: "USUARIO",
                keyColumn: "id_usuario",
                keyValue: 2,
                column: "password_hash",
                value: "PBKDF2-SHA256$100000$ajuJ9F8iqrjuhO1kLD1efw==$zvbre3ErVZg7zL2E9hlasj8WUp2a7aG6HExc/lBUWVY=");

            migrationBuilder.UpdateData(
                table: "USUARIO",
                keyColumn: "id_usuario",
                keyValue: 3,
                column: "password_hash",
                value: "PBKDF2-SHA256$100000$Buh8I9hywZ5DPPdVbSq5/g==$zbcAqrzZO5ksbWsepOM9II6q12vraC8dcTYogE+DI1o=");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "USUARIO",
                keyColumn: "id_usuario",
                keyValue: 1,
                column: "password_hash",
                value: "seed-password-hash-admin");

            migrationBuilder.UpdateData(
                table: "USUARIO",
                keyColumn: "id_usuario",
                keyValue: 2,
                column: "password_hash",
                value: "seed-password-hash-ventas");

            migrationBuilder.UpdateData(
                table: "USUARIO",
                keyColumn: "id_usuario",
                keyValue: 3,
                column: "password_hash",
                value: "seed-password-hash-almacen");
        }
    }
}
