using AuctionHouse.Api.Data;
using AuctionHouse.Api.DTOs;
using AuctionHouse.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace AuctionHouse.Api.Services
{
    public class AuctionService : IAuctionService
    {
        private readonly ApplicationDbContext _db;
        public AuctionService(ApplicationDbContext db) { _db = db; }

        public async Task<Auction> CreateAsync(int sellerId, AuctionCreateDto dto)
        {
            var auction = new Auction
            {
                Title = dto.Title,
                Description = dto.Description,
                StartPrice = dto.StartPrice,
                CurrentPrice = dto.StartPrice,
                StartTime = dto.StartTime.ToUniversalTime(),
                EndTime = dto.EndTime.ToUniversalTime(),
                SellerId = sellerId,
                Status = dto.StartTime <= DateTime.UtcNow ? "Open" : "Scheduled"
            };
            _db.Auctions.Add(auction);
            await _db.SaveChangesAsync();
            return auction;
        }

        public async Task<IEnumerable<Auction>> GetAllAsync()
            => await _db.Auctions.Include(a => a.Images).Include(a => a.Bids).ToListAsync();

        public async Task<Auction?> GetByIdAsync(int id)
            => await _db.Auctions.Include(a => a.Bids).Include(a => a.Images).FirstOrDefaultAsync(a => a.Id == id);

        public async Task CloseAuctionAsync(int id)
        {
            var auction = await _db.Auctions.FindAsync(id);
            if (auction == null) throw new ApplicationException("Auction not found");
            auction.Status = "Closed";
            await _db.SaveChangesAsync();
        }
    }
}
