using AuctionHouse.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AuctionHouse.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // All watchlist endpoints require authentication
    public class WatchlistController : ControllerBase
    {
        private readonly IWatchlistService _watchlistService;
        private readonly ILogger<WatchlistController> _logger;

        public WatchlistController(IWatchlistService watchlistService, ILogger<WatchlistController> logger)
        {
            _watchlistService = watchlistService;
            _logger = logger;
        }

        /// <summary>
        /// Add an auction to the current user's watchlist
        /// POST /api/watchlist/{auctionId}
        /// </summary>
        [HttpPost("{auctionId}")]
        public async Task<IActionResult> AddToWatchlist(int auctionId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
            {
                _logger.LogWarning("Invalid or missing user ID in token");
                return Unauthorized(new { message = "Invalid authentication token" });
            }

            var success = await _watchlistService.AddToWatchlistAsync(userId, auctionId);
            
            if (!success)
            {
                return BadRequest(new { message = "Failed to add auction to watchlist. Auction may not exist." });
            }

            return Ok(new { message = "Auction added to watchlist successfully", auctionId });
        }

        /// <summary>
        /// Remove an auction from the current user's watchlist
        /// DELETE /api/watchlist/{auctionId}
        /// </summary>
        [HttpDelete("{auctionId}")]
        public async Task<IActionResult> RemoveFromWatchlist(int auctionId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
            {
                _logger.LogWarning("Invalid or missing user ID in token");
                return Unauthorized(new { message = "Invalid authentication token" });
            }

            var success = await _watchlistService.RemoveFromWatchlistAsync(userId, auctionId);
            
            if (!success)
            {
                return NotFound(new { message = "Auction not found in watchlist" });
            }

            return Ok(new { message = "Auction removed from watchlist successfully", auctionId });
        }

        /// <summary>
        /// Get all auctions in the current user's watchlist
        /// GET /api/watchlist
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetWatchlist()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
            {
                _logger.LogWarning("Invalid or missing user ID in token");
                return Unauthorized(new { message = "Invalid authentication token" });
            }

            var watchlist = await _watchlistService.GetUserWatchlistAsync(userId);
            
            return Ok(watchlist);
        }

        /// <summary>
        /// Check if a specific auction is in the current user's watchlist
        /// GET /api/watchlist/check/{auctionId}
        /// </summary>
        [HttpGet("check/{auctionId}")]
        public async Task<IActionResult> CheckWatchlist(int auctionId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
            {
                _logger.LogWarning("Invalid or missing user ID in token");
                return Unauthorized(new { message = "Invalid authentication token" });
            }

            var isInWatchlist = await _watchlistService.IsInWatchlistAsync(userId, auctionId);
            
            return Ok(new { auctionId, isInWatchlist });
        }

        /// <summary>
        /// Get the count of users watching a specific auction
        /// GET /api/watchlist/watchers/{auctionId}
        /// </summary>
        [HttpGet("watchers/{auctionId}")]
        [AllowAnonymous] // Allow anyone to see how many people are watching
        public async Task<IActionResult> GetWatchersCount(int auctionId)
        {
            var count = await _watchlistService.GetWatchersCountAsync(auctionId);
            
            return Ok(new { auctionId, watchersCount = count });
        }
    }
}
