using AuctionHouse.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace AuctionHouse.Api.Data
{
    public static class SeedData
    {
        public static async Task EnsureSeedData(ApplicationDbContext db)
        {
            if (await db.Users.AnyAsync()) return;

            db.Users.Add(new User {
                Username = "admin",
                Email = "admin@local",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                Role = "Admin"
            });

            db.Users.Add(new User {
                Username = "seller",
                Email = "seller@local",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Seller@123"),
                Role = "Seller"
            });

            db.Users.Add(new User {
                Username = "buyer",
                Email = "buyer@local",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Buyer@123"),
                Role = "Buyer"
            });

            await db.SaveChangesAsync();
        }
    }
}
