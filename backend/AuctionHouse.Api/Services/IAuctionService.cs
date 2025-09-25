using AuctionHouse.Api.DTOs;
using AuctionHouse.Api.Models;

namespace AuctionHouse.Api.Services
{
    public interface IAuctionService
    {
        Task<IEnumerable<AuctionListDto>> GetAllAsync();
        Task<AuctionResponseDto?> GetByIdAsync(int id);
        Task<Auction> CreateAsync(int sellerId, AuctionCreateDto dto);
        Task CloseAuctionAsync(int id);
    }
}
