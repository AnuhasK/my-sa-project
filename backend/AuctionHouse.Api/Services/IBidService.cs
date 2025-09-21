using AuctionHouse.Api.Models;

namespace AuctionHouse.Api.Services
{
    public interface IBidService
    {
        Task<Bid> PlaceBidAsync(int bidderId, int auctionId, decimal amount);
    }
}
