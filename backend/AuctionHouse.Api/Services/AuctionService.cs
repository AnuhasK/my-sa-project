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
                CategoryId = dto.CategoryId > 0 ? dto.CategoryId : null,
                Status = dto.StartTime <= DateTime.UtcNow ? "Open" : "Scheduled"
            };
            _db.Auctions.Add(auction);
            await _db.SaveChangesAsync();
            return auction;
        }

        public async Task<IEnumerable<AuctionListDto>> GetAllAsync()
        {
            return await _db.Auctions
                .Include(a => a.Images)  // Explicitly include images
                .Include(a => a.Bids)    // Explicitly include bids for count
                .Include(a => a.Category) // Explicitly include category
                .Select(a => new AuctionListDto
                {
                    Id = a.Id,
                    Title = a.Title,
                    Description = a.Description,
                    CurrentPrice = a.CurrentPrice,
                    StartTime = a.StartTime,
                    EndTime = a.EndTime,
                    Status = a.Status,
                    CategoryName = a.Category != null ? a.Category.Name : "Uncategorized",
                    CategoryId = a.CategoryId ?? 0,
                    PrimaryImageUrl = a.Images.OrderBy(i => i.Id).FirstOrDefault() != null ? a.Images.OrderBy(i => i.Id).FirstOrDefault()!.Url : null,
                    BidCount = a.Bids.Count
                })
                .ToListAsync();
        }

        public async Task<AuctionResponseDto?> GetByIdAsync(int id)
        {
            return await _db.Auctions
                .Include(a => a.Images)  // Explicitly include images
                .Include(a => a.Bids)    // Explicitly include bids for count
                .Include(a => a.Category) // Explicitly include category
                .Where(a => a.Id == id)
                .Select(a => new AuctionResponseDto
                {
                    Id = a.Id,
                    Title = a.Title,
                    Description = a.Description,
                    StartPrice = a.StartPrice,
                    CurrentPrice = a.CurrentPrice,
                    StartTime = a.StartTime,
                    EndTime = a.EndTime,
                    SellerId = a.SellerId,
                    Status = a.Status,
                    CategoryName = a.Category != null ? a.Category.Name : "Uncategorized",
                    CategoryId = a.CategoryId ?? 0,
                    ImageUrls = a.Images.OrderBy(i => i.Id).Select(i => i.Url).ToList(),
                    BidCount = a.Bids.Count
                })
                .FirstOrDefaultAsync();
        }

        public async Task CloseAuctionAsync(int id)
        {
            var auction = await _db.Auctions.FindAsync(id);
            if (auction == null) throw new ApplicationException("Auction not found");
            auction.Status = "Closed";
            await _db.SaveChangesAsync();
        }

        public async Task<AuctionResponseDto?> UpdateAsync(int id, AuctionUpdateDto dto, int userId, bool isAdmin)
        {
            var auction = await _db.Auctions
                .Include(a => a.Bids)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (auction == null)
                throw new ApplicationException("Auction not found");

            // Check ownership or admin
            if (auction.SellerId != userId && !isAdmin)
                throw new UnauthorizedAccessException("You don't have permission to update this auction");

            // Check if auction has bids
            if (auction.Bids.Any())
                throw new ApplicationException("Cannot update auction that has bids");

            // Check if auction is already closed
            if (auction.Status == "Closed")
                throw new ApplicationException("Cannot update closed auction");

            // Update allowed fields
            auction.Title = dto.Title;
            auction.Description = dto.Description;
            auction.EndTime = dto.EndTime.ToUniversalTime();
            auction.CategoryId = dto.CategoryId > 0 ? dto.CategoryId : null;

            await _db.SaveChangesAsync();

            // Return updated auction
            return await GetByIdAsync(id);
        }

        public async Task<bool> DeleteAsync(int id, int userId, bool isAdmin)
        {
            var auction = await _db.Auctions
                .Include(a => a.Bids)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (auction == null)
                throw new ApplicationException("Auction not found");

            // Check ownership or admin
            if (auction.SellerId != userId && !isAdmin)
                throw new UnauthorizedAccessException("You don't have permission to delete this auction");

            // Check if auction has bids
            if (auction.Bids.Any())
                throw new ApplicationException("Cannot delete auction that has bids");

            // Soft delete - just mark as closed
            auction.Status = "Deleted";
            await _db.SaveChangesAsync();

            return true;
        }

        public async Task<IEnumerable<AuctionListDto>> GetUserAuctionsAsync(int userId)
        {
            return await _db.Auctions
                .Include(a => a.Images)
                .Include(a => a.Bids)
                .Include(a => a.Category)
                .Where(a => a.SellerId == userId && a.Status != "Deleted")
                .Select(a => new AuctionListDto
                {
                    Id = a.Id,
                    Title = a.Title,
                    Description = a.Description,
                    CurrentPrice = a.CurrentPrice,
                    StartTime = a.StartTime,
                    EndTime = a.EndTime,
                    Status = a.Status,
                    CategoryName = a.Category != null ? a.Category.Name : "Uncategorized",
                    CategoryId = a.CategoryId ?? 0,
                    PrimaryImageUrl = a.Images.OrderBy(i => i.Id).FirstOrDefault() != null ? a.Images.OrderBy(i => i.Id).FirstOrDefault()!.Url : null,
                    BidCount = a.Bids.Count
                })
                .OrderByDescending(a => a.StartTime)
                .ToListAsync();
        }
    }
}
