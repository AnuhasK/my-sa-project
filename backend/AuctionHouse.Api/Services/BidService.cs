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

        public BidService(ApplicationDbContext db, IConfiguration config)
        {
            _db = db;
            _config = config;
        }

        public async Task<Bid> PlaceBidAsync(int bidderId, int auctionId, decimal amount)
        {
            // simple transactional bid placement
            using var tx = await _db.Database.BeginTransactionAsync();

            var auction = await _db.Auctions.Include(a => a.Bids).FirstOrDefaultAsync(a => a.Id == auctionId);
            if (auction == null) throw new ApplicationException("Auction not found");
            var now = DateTime.UtcNow;
            if (auction.Status != "Open" || now < auction.StartTime || now > auction.EndTime)
                throw new ApplicationException("Auction not open for bidding");

            // minimum increment (optional config or fixed)
            var minIncrement = 1m;
            if (amount <= auction.CurrentPrice + minIncrement)
                throw new ApplicationException($"Bid must be greater than current price + {minIncrement}");

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
                BidderName = b.Bidder.Username,
                Amount = b.Amount,
                Timestamp = b.Timestamp,
                IsWinning = b.Id == winningBidId
            });
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
