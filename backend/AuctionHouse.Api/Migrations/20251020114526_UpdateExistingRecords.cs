using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AuctionHouse.Api.Migrations
{
    /// <inheritdoc />
    public partial class UpdateExistingRecords : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Update existing users to have IsActive = true and CreatedAt = now
            migrationBuilder.Sql(@"
                UPDATE Users 
                SET IsActive = 1, CreatedAt = GETUTCDATE() 
                WHERE CreatedAt = '0001-01-01T00:00:00.0000000'
            ");

            // Update existing auctions to have CreatedAt = StartTime
            migrationBuilder.Sql(@"
                UPDATE Auctions 
                SET CreatedAt = StartTime 
                WHERE CreatedAt = '0001-01-01T00:00:00.0000000'
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
