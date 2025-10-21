using AuctionHouse.Api.Data;
using AuctionHouse.Api.DTOs;
using AuctionHouse.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace AuctionHouse.Api.Services
{
    public class WatchlistService : IWatchlistService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<WatchlistService> _logger;

        public WatchlistService(ApplicationDbContext context, ILogger<WatchlistService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<bool> AddToWatchlistAsync(int userId, int auctionId)
        {
            try
            {
                // Check if auction exists
                var auctionExists = await _context.Auctions.AnyAsync(a => a.Id == auctionId);
                if (!auctionExists)
                {
                    _logger.LogWarning("Attempted to add non-existent auction {AuctionId} to watchlist", auctionId);
                    return false;
                }

                // Check if already in watchlist
                var existingWatchlist = await _context.Watchlists
                    .FirstOrDefaultAsync(w => w.UserId == userId && w.AuctionId == auctionId);

                if (existingWatchlist != null)
                {
                    _logger.LogInformation("Auction {AuctionId} already in user {UserId} watchlist", auctionId, userId);
                    return true; // Already exists, consider it success
                }

                // Add to watchlist
                var watchlist = new Watchlist
                {
                    UserId = userId,
                    AuctionId = auctionId,
                    AddedDate = DateTime.UtcNow
                };

                _context.Watchlists.Add(watchlist);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Added auction {AuctionId} to user {UserId} watchlist", auctionId, userId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding auction {AuctionId} to user {UserId} watchlist", auctionId, userId);
                return false;
            }
        }

        public async Task<bool> RemoveFromWatchlistAsync(int userId, int auctionId)
        {
            try
            {
                var watchlist = await _context.Watchlists
                    .FirstOrDefaultAsync(w => w.UserId == userId && w.AuctionId == auctionId);

                if (watchlist == null)
                {
                    _logger.LogWarning("Watchlist entry not found for user {UserId} and auction {AuctionId}", userId, auctionId);
                    return false;
                }

                _context.Watchlists.Remove(watchlist);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Removed auction {AuctionId} from user {UserId} watchlist", auctionId, userId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing auction {AuctionId} from user {UserId} watchlist", auctionId, userId);
                return false;
            }
        }

        public async Task<List<WatchlistAuctionDto>> GetUserWatchlistAsync(int userId)
        {
            try
            {
                var watchlist = await _context.Watchlists
                    .Where(w => w.UserId == userId)
                    .Include(w => w.Auction)
                        .ThenInclude(a => a!.Bids)
                    .Include(w => w.Auction)
                        .ThenInclude(a => a!.Images)
                    .Include(w => w.Auction)
                        .ThenInclude(a => a!.Category)
                    .OrderByDescending(w => w.AddedDate)
                    .ToListAsync();

                var result = watchlist
                    .Where(w => w.Auction != null && w.Auction.Status != "Deleted") // Filter out deleted auctions
                    .Select(w =>
                    {
                        var auction = w.Auction;
                        var currentBid = auction!.Bids?.Any() == true
                            ? auction.Bids.Max(b => b.Amount)
                            : auction.StartPrice;

                        // Get first image since IsPrimary doesn't exist
                        var firstImage = auction.Images?.FirstOrDefault();

                        var timeUntilEnd = auction.EndTime - DateTime.UtcNow;
                        var isEnding = timeUntilEnd.TotalHours <= 24 && timeUntilEnd.TotalHours > 0;

                        return new WatchlistAuctionDto
                        {
                            Id = w.Id,
                            AuctionId = auction.Id,
                            Title = auction.Title,
                            Description = auction.Description,
                            CurrentBid = currentBid,
                            EndDate = auction.EndTime,
                            ImageUrl = firstImage?.Url,
                            CategoryName = auction.Category?.Name,
                            Status = auction.Status,
                            TotalBids = auction.Bids?.Count ?? 0,
                            AddedToWatchlistDate = w.AddedDate,
                            IsEnding = isEnding
                        };
                    }).ToList();

                _logger.LogInformation("Retrieved {Count} watchlist items for user {UserId}", result.Count, userId);
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving watchlist for user {UserId}", userId);
                return new List<WatchlistAuctionDto>();
            }
        }

        public async Task<bool> IsInWatchlistAsync(int userId, int auctionId)
        {
            try
            {
                return await _context.Watchlists
                    .AnyAsync(w => w.UserId == userId && w.AuctionId == auctionId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking if auction {AuctionId} is in user {UserId} watchlist", auctionId, userId);
                return false;
            }
        }

        public async Task<int> GetWatchersCountAsync(int auctionId)
        {
            try
            {
                return await _context.Watchlists
                    .CountAsync(w => w.AuctionId == auctionId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting watchers count for auction {AuctionId}", auctionId);
                return 0;
            }
        }
    }
}
