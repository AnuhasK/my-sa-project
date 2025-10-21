using AuctionHouse.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace AuctionHouse.Api.Data
{
    public static class SeedData
    {
        public static async Task EnsureSeedData(ApplicationDbContext db)
        {
            // Only seed if database is empty
            if (await db.Users.AnyAsync()) return;

            // Create Users - Admins manage auctions, Users place bids
            var admin = new User {
                Username = "admin",
                Email = "admin@auctionhouse.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                Role = "Admin"
            };

            var admin2 = new User {
                Username = "admin2",
                Email = "admin2@auctionhouse.com", 
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin2@123"),
                Role = "Admin"
            };

            var user1 = new User {
                Username = "dinitha",
                Email = "dinitha@gmail.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("User@123"),
                Role = "User"
            };

            var user2 = new User {
                Username = "nipuna",
                Email = "nipuna@gmail.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("User@123"),
                Role = "User"
            };

            var user3 = new User {
                Username = "kasuntha",
                Email = "kasuntha@gmail.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("User@123"),
                Role = "User"
            };

            db.Users.AddRange(admin, admin2, user1, user2, user3);
            await db.SaveChangesAsync();

            // Create Categories
            var categories = new List<Category>
            {
                new Category { Name = "Electronics", Description = "Electronic devices, computers, phones, gadgets" },
                new Category { Name = "Musical Instruments", Description = "Guitars, pianos, drums, and other musical equipment" },
                new Category { Name = "Fashion & Accessories", Description = "Clothing, jewelry, watches, bags" },
                new Category { Name = "Home & Garden", Description = "Furniture, decor, rugs, appliances" },
                new Category { Name = "Gaming", Description = "Video games, consoles, gaming accessories" },
                new Category { Name = "Photography", Description = "Cameras, lenses, photography equipment" },
                new Category { Name = "Collectibles", Description = "Antiques, rare items, memorabilia" },
                new Category { Name = "Sports & Recreation", Description = "Sports equipment, outdoor gear, fitness items" }
            };

            db.Categories.AddRange(categories);
            await db.SaveChangesAsync();

            // Create Auctions - All auctions are created and managed by admins
            var now = DateTime.UtcNow;

            var auction1 = new Auction {
                Title = "Vintage 1967 Gibson Les Paul Guitar",
                Description = "Rare vintage Gibson Les Paul Standard in excellent condition. Cherry sunburst finish with original hardware. Perfect for collectors and professional musicians.",
                StartPrice = 2500.00m,
                CurrentPrice = 3200.00m,
                StartTime = now.AddDays(-3),
                EndTime = now.AddDays(2),
                SellerId = admin.Id,
                CategoryId = categories[1].Id, // Musical Instruments
                Status = "Open"
            };

            var auction2 = new Auction {
                Title = "MacBook Pro 16-inch M3 Max - Sealed",
                Description = "Brand new, sealed MacBook Pro 16-inch with M3 Max chip, 32GB RAM, 1TB SSD. Space Black color. Full warranty included.",
                StartPrice = 2000.00m,
                CurrentPrice = 2400.00m,
                StartTime = now.AddDays(-2),
                EndTime = now.AddDays(3),
                SellerId = admin.Id,
                CategoryId = categories[0].Id, // Electronics
                Status = "Open"
            };

            var auction3 = new Auction {
                Title = "Rolex Submariner Date - 2023 Model",
                Description = "Authentic Rolex Submariner Date 126610LN. Black dial and bezel. Purchased new in 2023, worn only a few times. Box and papers included.",
                StartPrice = 8000.00m,
                CurrentPrice = 9500.00m,
                StartTime = now.AddDays(-1),
                EndTime = now.AddDays(5),
                SellerId = admin2.Id,
                CategoryId = categories[2].Id, // Fashion & Accessories
                Status = "Open"
            };

            var auction4 = new Auction {
                Title = "Antique Persian Rug - Hand Woven",
                Description = "Beautiful hand-woven Persian rug, approximately 8x10 feet. Intricate patterns with rich colors. Professionally cleaned and authenticated.",
                StartPrice = 1500.00m,
                CurrentPrice = 1500.00m,
                StartTime = now.AddDays(-4),
                EndTime = now.AddDays(1),
                SellerId = admin.Id,
                CategoryId = categories[3].Id, // Home & Garden
                Status = "Open"
            };

            var auction5 = new Auction {
                Title = "PlayStation 5 Console + Games Bundle",
                Description = "PlayStation 5 console with 2 controllers, charging station, and 5 popular games including Spider-Man 2 and God of War Ragnarök.",
                StartPrice = 400.00m,
                CurrentPrice = 650.00m,
                StartTime = now.AddDays(-7),
                EndTime = now.AddDays(-1),
                SellerId = admin2.Id,
                CategoryId = categories[4].Id, // Gaming
                Status = "Closed"
            };

            var auction6 = new Auction {
                Title = "Professional DSLR Camera Kit",
                Description = "Canon EOS R6 Mark II with 24-70mm f/2.8 lens, extra batteries, memory cards, and professional camera bag. Perfect for photography enthusiasts.",
                StartPrice = 1800.00m,
                CurrentPrice = 1800.00m,
                StartTime = now.AddHours(2),
                EndTime = now.AddDays(7),
                SellerId = admin.Id,
                CategoryId = categories[5].Id, // Photography
                Status = "Scheduled"
            };

            db.Auctions.AddRange(auction1, auction2, auction3, auction4, auction5, auction6);
            await db.SaveChangesAsync();

            // Create Sample Bids - Users can bid on admin-created auctions
            var bids = new List<Bid>
            {
                // Bids for Gibson Guitar
                new Bid { AuctionId = auction1.Id, BidderId = user1.Id, Amount = 2600.00m, Timestamp = now.AddDays(-2).AddHours(-3) },
                new Bid { AuctionId = auction1.Id, BidderId = user2.Id, Amount = 2800.00m, Timestamp = now.AddDays(-2).AddHours(-1) },
                new Bid { AuctionId = auction1.Id, BidderId = user1.Id, Amount = 3000.00m, Timestamp = now.AddDays(-1).AddHours(-4) },
                new Bid { AuctionId = auction1.Id, BidderId = user3.Id, Amount = 3200.00m, Timestamp = now.AddDays(-1).AddHours(-2) },

                // Bids for MacBook
                new Bid { AuctionId = auction2.Id, BidderId = user2.Id, Amount = 2100.00m, Timestamp = now.AddDays(-1).AddHours(-6) },
                new Bid { AuctionId = auction2.Id, BidderId = user1.Id, Amount = 2300.00m, Timestamp = now.AddDays(-1).AddHours(-3) },
                new Bid { AuctionId = auction2.Id, BidderId = user3.Id, Amount = 2400.00m, Timestamp = now.AddHours(-2) },

                // Bids for Rolex
                new Bid { AuctionId = auction3.Id, BidderId = user1.Id, Amount = 8500.00m, Timestamp = now.AddHours(-5) },
                new Bid { AuctionId = auction3.Id, BidderId = user2.Id, Amount = 9000.00m, Timestamp = now.AddHours(-3) },
                new Bid { AuctionId = auction3.Id, BidderId = user3.Id, Amount = 9500.00m, Timestamp = now.AddHours(-1) },

                // Bids for PlayStation (closed auction)
                new Bid { AuctionId = auction5.Id, BidderId = user1.Id, Amount = 450.00m, Timestamp = now.AddDays(-6) },
                new Bid { AuctionId = auction5.Id, BidderId = user2.Id, Amount = 550.00m, Timestamp = now.AddDays(-5) },
                new Bid { AuctionId = auction5.Id, BidderId = user1.Id, Amount = 600.00m, Timestamp = now.AddDays(-4) },
                new Bid { AuctionId = auction5.Id, BidderId = user3.Id, Amount = 650.00m, Timestamp = now.AddDays(-3) }
            };

            db.Bids.AddRange(bids);
            await db.SaveChangesAsync();

            // Create Sample Auction Images (using placeholder URLs)
            var images = new List<AuctionImage>
            {
                // Gibson Guitar Images
                new AuctionImage { AuctionId = auction1.Id, Url = "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800" },
                new AuctionImage { AuctionId = auction1.Id, Url = "https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=800" },

                // MacBook Images
                new AuctionImage { AuctionId = auction2.Id, Url = "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800" },
                new AuctionImage { AuctionId = auction2.Id, Url = "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800" },

                // Rolex Images
                new AuctionImage { AuctionId = auction3.Id, Url = "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800" },
                new AuctionImage { AuctionId = auction3.Id, Url = "https://images.unsplash.com/photo-1594534475808-b18fc33b045e?w=800" },

                // Persian Rug Images
                new AuctionImage { AuctionId = auction4.Id, Url = "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800" },

                // PlayStation Images
                new AuctionImage { AuctionId = auction5.Id, Url = "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800" },
                new AuctionImage { AuctionId = auction5.Id, Url = "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=800" },

                // Camera Images
                new AuctionImage { AuctionId = auction6.Id, Url = "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800" },
                new AuctionImage { AuctionId = auction6.Id, Url = "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800" }
            };

            db.AuctionImages.AddRange(images);
            await db.SaveChangesAsync();
        }
    }
}
