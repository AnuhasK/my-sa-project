using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AuctionHouse.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddCategoriesWithNullable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CategoryId",
                table: "Auctions",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Categories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Auctions_CategoryId",
                table: "Auctions",
                column: "CategoryId");

            migrationBuilder.AddForeignKey(
                name: "FK_Auctions_Categories_CategoryId",
                table: "Auctions",
                column: "CategoryId",
                principalTable: "Categories",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Auctions_Categories_CategoryId",
                table: "Auctions");

            migrationBuilder.DropTable(
                name: "Categories");

            migrationBuilder.DropIndex(
                name: "IX_Auctions_CategoryId",
                table: "Auctions");

            migrationBuilder.DropColumn(
                name: "CategoryId",
                table: "Auctions");
        }
    }
}
