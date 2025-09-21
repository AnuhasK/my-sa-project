using AuctionHouse.Api.DTOs;
using AuctionHouse.Api.Models;

namespace AuctionHouse.Api.Services
{
    public interface IAuctionService
    {
        Task<IEnumerable<Auction>> GetAllAsync();
        Task<Auction?> GetByIdAsync(int id);
        Task<Auction> CreateAsync(int sellerId, AuctionCreateDto dto);
        Task CloseAuctionAsync(int id);
    }
}
