using AuctionHouse.Api.Data;
using AuctionHouse.Api.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace AuctionHouse.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly ILogger<UsersController> _logger;

        public UsersController(ApplicationDbContext db, ILogger<UsersController> logger)
        {
            _db = db;
            _logger = logger;
        }

        /// <summary>
        /// Get current user's statistics
        /// </summary>
        [HttpGet("stats")]
        public async Task<IActionResult> GetUserStats()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
                    return Unauthorized(new { message = "Invalid user token" });

                // Get total bids
                var totalBids = await _db.Bids
                    .Where(b => b.BidderId == userId)
                    .CountAsync();

                // Get active bids (auctions that are still open and user has bid on)
                var activeBids = await _db.Bids
                    .Where(b => b.BidderId == userId)
                    .Join(_db.Auctions,
                        bid => bid.AuctionId,
                        auction => auction.Id,
                        (bid, auction) => new { bid, auction })
                    .Where(x => x.auction.Status == "Open")
                    .Select(x => x.auction.Id)
                    .Distinct()
                    .CountAsync();

                // Get won auctions (closed auctions where user has the highest bid)
                var wonAuctions = await _db.Auctions
                    .Where(a => a.Status == "Closed")
                    .Select(a => new
                    {
                        AuctionId = a.Id,
                        WinningBid = _db.Bids
                            .Where(b => b.AuctionId == a.Id)
                            .OrderByDescending(b => b.Amount)
                            .Select(b => new { b.BidderId, b.Amount })
                            .FirstOrDefault()
                    })
                    .Where(x => x.WinningBid != null && x.WinningBid.BidderId == userId)
                    .CountAsync();

                // Get active auctions (auctions created by user that are still open)
                var activeAuctions = await _db.Auctions
                    .Where(a => a.SellerId == userId && a.Status == "Open")
                    .CountAsync();

                // Get total spent (sum of winning bids)
                var totalSpent = await _db.Auctions
                    .Where(a => a.Status == "Closed")
                    .Select(a => new
                    {
                        AuctionId = a.Id,
                        CurrentPrice = a.CurrentPrice,
                        WinningBid = _db.Bids
                            .Where(b => b.AuctionId == a.Id)
                            .OrderByDescending(b => b.Amount)
                            .Select(b => new { b.BidderId })
                            .FirstOrDefault()
                    })
                    .Where(x => x.WinningBid != null && x.WinningBid.BidderId == userId)
                    .SumAsync(x => x.CurrentPrice);

                // Get watchlist count
                var watchlistCount = await _db.Watchlists
                    .Where(w => w.UserId == userId)
                    .CountAsync();

                var stats = new UserStatsDto
                {
                    TotalBids = totalBids,
                    ActiveBids = activeBids,
                    WonAuctions = wonAuctions,
                    ActiveAuctions = activeAuctions,
                    TotalSpent = totalSpent,
                    WatchlistCount = watchlistCount
                };

                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user stats");
                return StatusCode(500, new { message = "Error retrieving user statistics" });
            }
        }

        /// <summary>
        /// Get user's active bids (auctions they're bidding on)
        /// </summary>
        [HttpGet("active-bids")]
        public async Task<IActionResult> GetActiveBids()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
                    return Unauthorized(new { message = "Invalid user token" });

                var activeBids = await _db.Bids
                    .Where(b => b.BidderId == userId)
                    .Join(_db.Auctions,
                        bid => bid.AuctionId,
                        auction => auction.Id,
                        (bid, auction) => new { bid, auction })
                    .Where(x => x.auction.Status == "Open")
                    .GroupBy(x => x.auction)
                    .Select(g => new
                    {
                        AuctionId = g.Key.Id,
                        Title = g.Key.Title,
                        CurrentBid = g.Key.CurrentPrice,
                        MyBid = g.Max(x => x.bid.Amount),
                        TimeLeft = g.Key.EndTime,
                        Status = g.Key.CurrentPrice > g.Max(x => x.bid.Amount) ? "outbid" : "winning"
                    })
                    .ToListAsync();

                return Ok(activeBids);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting active bids");
                return StatusCode(500, new { message = "Error retrieving active bids" });
            }
        }

        /// <summary>
        /// Get user's won auctions
        /// </summary>
        [HttpGet("won-auctions")]
        public async Task<IActionResult> GetWonAuctions()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
                    return Unauthorized(new { message = "Invalid user token" });

                var wonAuctions = await _db.Auctions
                    .Where(a => a.Status == "Closed")
                    .Select(a => new
                    {
                        Auction = a,
                        WinningBid = _db.Bids
                            .Where(b => b.AuctionId == a.Id)
                            .OrderByDescending(b => b.Amount)
                            .Select(b => new { b.BidderId, b.Amount })
                            .FirstOrDefault()
                    })
                    .Where(x => x.WinningBid != null && x.WinningBid.BidderId == userId)
                    .Select(x => new
                    {
                        AuctionId = x.Auction.Id,
                        Title = x.Auction.Title,
                        WinningBid = x.WinningBid!.Amount, // ! tells compiler we know it's not null
                        EndedAt = x.Auction.EndTime
                    })
                    .ToListAsync();

                return Ok(wonAuctions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting won auctions");
                return StatusCode(500, new { message = "Error retrieving won auctions" });
            }
        }
    }
}
