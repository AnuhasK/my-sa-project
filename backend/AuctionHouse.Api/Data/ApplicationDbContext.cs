using AuctionHouse.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace AuctionHouse.Api.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Auction> Auctions { get; set; }
        public DbSet<Bid> Bids { get; set; }
        public DbSet<AuctionImage> AuctionImages { get; set; }
        public DbSet<Transaction> Transactions { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Watchlist> Watchlists { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();
            modelBuilder.Entity<Auction>()
        .HasMany(a => a.Bids)
        .WithOne(b => b.Auction)
        .HasForeignKey(b => b.AuctionId)
        .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Bid>()
        .HasOne(b => b.Bidder)
        .WithMany()
        .HasForeignKey(b => b.BidderId)
        .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Auction>()
        .HasMany(a => a.Transactions)
        .WithOne(t => t.Auction)
        .HasForeignKey(t => t.AuctionId)
        .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Transaction>()
        .HasOne(t => t.Buyer)
        .WithMany()
        .HasForeignKey(t => t.BuyerId)
        .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Auction>()
        .HasMany(a => a.Images)
        .WithOne(i => i.Auction)
        .HasForeignKey(i => i.AuctionId)
        .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Auction>()
        .HasOne(a => a.Category)
        .WithMany(c => c.Auctions)
        .HasForeignKey(a => a.CategoryId)
        .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Auction>()
                .Property(a => a.CurrentPrice)
                .HasPrecision(18, 2); // 18 digits, 2 decimal places

            modelBuilder.Entity<Auction>()
                .Property(a => a.StartPrice)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Bid>()
                .Property(b => b.Amount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Transaction>()
                .Property(t => t.Amount)
                .HasPrecision(18, 2);

            // Watchlist configuration - ensure unique constraint (one user can't watch same auction twice)
            modelBuilder.Entity<Watchlist>()
                .HasIndex(w => new { w.UserId, w.AuctionId })
                .IsUnique();

            // Prevent cascade delete conflicts - when user is deleted, remove watchlist entries
            modelBuilder.Entity<Watchlist>()
                .HasOne(w => w.User)
                .WithMany()
                .HasForeignKey(w => w.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // When auction is deleted, remove watchlist entries (no action to avoid conflict)
            modelBuilder.Entity<Watchlist>()
                .HasOne(w => w.Auction)
                .WithMany()
                .HasForeignKey(w => w.AuctionId)
                .OnDelete(DeleteBehavior.NoAction);

            base.OnModelCreating(modelBuilder);
        }
    }
}
