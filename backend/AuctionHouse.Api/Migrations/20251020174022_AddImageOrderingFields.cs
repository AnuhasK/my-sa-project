using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AuctionHouse.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddImageOrderingFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DisplayOrder",
                table: "AuctionImages",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsPrimary",
                table: "AuctionImages",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DisplayOrder",
                table: "AuctionImages");

            migrationBuilder.DropColumn(
                name: "IsPrimary",
                table: "AuctionImages");
        }
    }
}
