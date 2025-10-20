using AuctionHouse.Api.Data;
using AuctionHouse.Api.DTOs;
using AuctionHouse.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace AuctionHouse.Api.Services
{
    public class BidService : IBidService
    {
        private readonly ApplicationDbContext _db;
        private readonly IConfiguration _config;
        private readonly IServiceScopeFactory _scopeFactory;

        public BidService(ApplicationDbContext db, IConfiguration config, IServiceScopeFactory scopeFactory)
        {
            _db = db;
            _config = config;
            _scopeFactory = scopeFactory;
        }

        public async Task<Bid> PlaceBidAsync(int bidderId, int auctionId, decimal amount)
        {
            // simple transactional bid placement
            using var tx = await _db.Database.BeginTransactionAsync();

            var auction = await _db.Auctions
                .Include(a => a.Bids.OrderByDescending(b => b.Amount).Take(1))
                .FirstOrDefaultAsync(a => a.Id == auctionId);
            
            if (auction == null) 
                throw new ApplicationException("Auction not found");

            // Check if auction is open for bidding
            var now = DateTime.UtcNow;
            if (auction.Status != "Open" && auction.Status != "Active")
                throw new ApplicationException("Auction is not open for bidding");
            
            if (now < auction.StartTime)
                throw new ApplicationException("Auction has not started yet");
            
            if (now > auction.EndTime)
                throw new ApplicationException("Auction has ended");

            // Prevent seller from bidding on their own auction
            if (auction.SellerId == bidderId)
                throw new ApplicationException("You cannot bid on your own auction");

            // Get previous highest bidder (if exists)
            var previousHighestBid = auction.Bids.FirstOrDefault();
            int? previousBidderId = previousHighestBid?.BidderId;

            // Bid must be greater than current price (with minimum increment)
            var minIncrement = 1m;
            var minBidAmount = auction.CurrentPrice + minIncrement;
            
            if (amount < minBidAmount)
                throw new ApplicationException($"Bid must be at least ${minBidAmount:F2} (current price + ${minIncrement:F2})");

            var bid = new Bid
            {
                AuctionId = auctionId,
                BidderId = bidderId,
                Amount = amount,
                Timestamp = now
            };

            _db.Bids.Add(bid);
            auction.CurrentPrice = amount;

            // anti-sniping: if bid within last X seconds extend
            var extendSeconds = 15;
            if ((auction.EndTime - now).TotalSeconds <= extendSeconds)
            {
                auction.EndTime = auction.EndTime.AddSeconds(extendSeconds);
            }

            await _db.SaveChangesAsync();
            await tx.CommitAsync();

            // Create notifications (in background with new scope, don't block bid placement)
            var sellerId = auction.SellerId;
            var auctionTitle = auction.Title;
            
            _ = Task.Run(async () =>
            {
                try
                {
                    using var scope = _scopeFactory.CreateScope();
                    var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();

                    // Notify auction owner of new bid
                    if (sellerId != bidderId)
                    {
                        await notificationService.CreateNotificationAsync(
                            sellerId,
                            NotificationType.BidPlaced,
                            "New Bid Placed",
                            $"Someone placed a ${amount} bid on your auction: {auctionTitle}",
                            auctionId
                        );
                    }

                    // Notify previous highest bidder they've been outbid
                    if (previousBidderId.HasValue && previousBidderId.Value != bidderId)
                    {
                        await notificationService.CreateNotificationAsync(
                            previousBidderId.Value,
                            NotificationType.BidOutbid,
                            "You've Been Outbid!",
                            $"Someone outbid you on: {auctionTitle}. Current price: ${amount}",
                            auctionId
                        );
                    }
                }
                catch
                {
                    // Swallow notification errors - don't fail bid placement
                }
            });

            return bid;
        }

        public async Task<IEnumerable<BidDto>> GetBidsForAuctionAsync(int auctionId)
        {
            var bids = await _db.Bids
                .Include(b => b.Bidder)
                .Include(b => b.Auction)
                .Where(b => b.AuctionId == auctionId)
                .OrderByDescending(b => b.Amount)
                .ThenByDescending(b => b.Timestamp)
                .ToListAsync();

            // Determine the winning bid (highest amount)
            var winningBidId = bids.FirstOrDefault()?.Id;

            return bids.Select(b => new BidDto
            {
                Id = b.Id,
                AuctionId = b.AuctionId,
                AuctionTitle = b.Auction.Title,
                BidderId = b.BidderId,
                BidderName = MaskUsername(b.Bidder.Username), // Mask for privacy
                Amount = b.Amount,
                Timestamp = b.Timestamp,
                IsWinning = b.Id == winningBidId
            });
        }

        // Helper method to mask usernames for privacy
        private string MaskUsername(string username)
        {
            if (string.IsNullOrEmpty(username) || username.Length <= 2)
                return "u***";
            
            // Show first and last character, mask the rest
            return $"{username[0]}***{username[username.Length - 1]}";
        }

        public async Task<IEnumerable<BidDto>> GetUserBidsAsync(int userId)
        {
            var bids = await _db.Bids
                .Include(b => b.Bidder)
                .Include(b => b.Auction)
                .Where(b => b.BidderId == userId)
                .OrderByDescending(b => b.Timestamp)
                .ToListAsync();

            // Group by auction to determine if user is currently winning each auction
            var auctionIds = bids.Select(b => b.AuctionId).Distinct();
            var winningBids = new Dictionary<int, int>();

            foreach (var auctionId in auctionIds)
            {
                var highestBid = await _db.Bids
                    .Where(b => b.AuctionId == auctionId)
                    .OrderByDescending(b => b.Amount)
                    .ThenByDescending(b => b.Timestamp)
                    .FirstOrDefaultAsync();

                if (highestBid != null)
                {
                    winningBids[auctionId] = highestBid.Id;
                }
            }

            return bids.Select(b => new BidDto
            {
                Id = b.Id,
                AuctionId = b.AuctionId,
                AuctionTitle = b.Auction.Title,
                BidderId = b.BidderId,
                BidderName = b.Bidder.Username,
                Amount = b.Amount,
                Timestamp = b.Timestamp,
                IsWinning = winningBids.ContainsKey(b.AuctionId) && winningBids[b.AuctionId] == b.Id
            });
        }
    }
}
