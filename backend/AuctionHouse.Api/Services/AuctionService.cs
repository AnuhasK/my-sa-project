using AuctionHouse.Api.Data;
using AuctionHouse.Api.DTOs;
using AuctionHouse.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace AuctionHouse.Api.Services
{
    public class AuctionService : IAuctionService
    {
        private readonly ApplicationDbContext _db;
        
        public AuctionService(ApplicationDbContext db) 
        { 
            _db = db;
        }

        public async Task<Auction> CreateAsync(int sellerId, AuctionCreateDto dto)
        {
            // Validate times
            var now = DateTime.UtcNow;
            var startTimeUtc = dto.StartTime.ToUniversalTime();
            var endTimeUtc = dto.EndTime.ToUniversalTime();

            if (startTimeUtc <= now)
            {
                throw new ApplicationException("Start time must be in the future");
            }

            if (endTimeUtc <= startTimeUtc)
            {
                throw new ApplicationException("End time must be after start time");
            }

            var duration = endTimeUtc - startTimeUtc;
            if (duration.TotalHours < 1)
            {
                throw new ApplicationException("Auction must run for at least 1 hour");
            }

            var auction = new Auction
            {
                Title = dto.Title,
                Description = dto.Description,
                StartPrice = dto.StartPrice,
                CurrentPrice = dto.StartPrice,
                StartTime = startTimeUtc,
                EndTime = endTimeUtc,
                SellerId = sellerId,
                CategoryId = dto.CategoryId > 0 ? dto.CategoryId : null,
                Status = "Pending" // All new auctions start as Pending for admin review
            };
            _db.Auctions.Add(auction);
            await _db.SaveChangesAsync();
            return auction;
        }

        public async Task<IEnumerable<AuctionListDto>> GetAllAsync(
            string? search = null,
            int? categoryId = null,
            string? status = null,
            decimal? minPrice = null,
            decimal? maxPrice = null,
            string? sortBy = null)
        {
            var query = _db.Auctions
                .Include(a => a.Images)  // Explicitly include images
                .Include(a => a.Bids)    // Explicitly include bids for count
                .Include(a => a.Category) // Explicitly include category
                .AsQueryable();

            // Apply search filter
            if (!string.IsNullOrWhiteSpace(search))
            {
                var searchLower = search.ToLower();
                query = query.Where(a => 
                    a.Title.ToLower().Contains(searchLower) || 
                    a.Description.ToLower().Contains(searchLower));
            }

            // Apply category filter
            if (categoryId.HasValue && categoryId.Value > 0)
            {
                query = query.Where(a => a.CategoryId == categoryId.Value);
            }

            // Apply status filter
            if (!string.IsNullOrWhiteSpace(status) && status.ToLower() != "all")
            {
                query = query.Where(a => a.Status.ToLower() == status.ToLower());
            }

            // Apply price range filter
            if (minPrice.HasValue)
            {
                query = query.Where(a => a.CurrentPrice >= minPrice.Value);
            }
            if (maxPrice.HasValue)
            {
                query = query.Where(a => a.CurrentPrice <= maxPrice.Value);
            }

            // Apply sorting
            query = sortBy?.ToLower() switch
            {
                "ending-soon" => query.OrderBy(a => a.EndTime),
                "price-low" => query.OrderBy(a => a.CurrentPrice),
                "price-high" => query.OrderByDescending(a => a.CurrentPrice),
                "newest" => query.OrderByDescending(a => a.Id),
                _ => query.OrderByDescending(a => a.Id) // Default: newest first
            };

            return await query
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
                    PrimaryImageUrl = a.Images.OrderBy(i => i.IsPrimary ? 0 : 1).ThenBy(i => i.DisplayOrder).FirstOrDefault() != null ? a.Images.OrderBy(i => i.IsPrimary ? 0 : 1).ThenBy(i => i.DisplayOrder).FirstOrDefault()!.Url : null,
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
                    ImageUrls = a.Images.OrderBy(i => i.IsPrimary ? 0 : 1).ThenBy(i => i.DisplayOrder).Select(i => i.Url).ToList(),
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
            
            // Note: Transaction creation is handled by AuctionClosingService background job
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
                    PrimaryImageUrl = a.Images.OrderBy(i => i.IsPrimary ? 0 : 1).ThenBy(i => i.DisplayOrder).FirstOrDefault() != null ? a.Images.OrderBy(i => i.IsPrimary ? 0 : 1).ThenBy(i => i.DisplayOrder).FirstOrDefault()!.Url : null,
                    BidCount = a.Bids.Count
                })
                .OrderByDescending(a => a.StartTime)
                .ToListAsync();
        }
    }
}
