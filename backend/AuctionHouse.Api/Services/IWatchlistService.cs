using AuctionHouse.Api.DTOs;

namespace AuctionHouse.Api.Services
{
    public interface IWatchlistService
    {
        /// <summary>
        /// Add an auction to user's watchlist
        /// </summary>
        Task<bool> AddToWatchlistAsync(int userId, int auctionId);

        /// <summary>
        /// Remove an auction from user's watchlist
        /// </summary>
        Task<bool> RemoveFromWatchlistAsync(int userId, int auctionId);

        /// <summary>
        /// Get all auctions in user's watchlist with full details
        /// </summary>
        Task<List<WatchlistAuctionDto>> GetUserWatchlistAsync(int userId);

        /// <summary>
        /// Check if an auction is in user's watchlist
        /// </summary>
        Task<bool> IsInWatchlistAsync(int userId, int auctionId);

        /// <summary>
        /// Get count of users watching a specific auction
        /// </summary>
        Task<int> GetWatchersCountAsync(int auctionId);
    }
}
