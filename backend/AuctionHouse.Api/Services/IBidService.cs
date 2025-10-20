using AuctionHouse.Api.DTOs;
using AuctionHouse.Api.Models;

namespace AuctionHouse.Api.Services
{
    public interface IBidService
    {
        Task<Bid> PlaceBidAsync(int bidderId, int auctionId, decimal amount);
        Task<IEnumerable<BidDto>> GetBidsForAuctionAsync(int auctionId);
        Task<IEnumerable<BidDto>> GetUserBidsAsync(int userId);
    }
}
