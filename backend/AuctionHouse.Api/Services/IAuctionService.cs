using AuctionHouse.Api.DTOs;
using AuctionHouse.Api.Models;

namespace AuctionHouse.Api.Services
{
    public interface IAuctionService
    {
        Task<IEnumerable<AuctionListDto>> GetAllAsync(
            string? search = null,
            int? categoryId = null,
            string? status = null,
            decimal? minPrice = null,
            decimal? maxPrice = null,
            string? sortBy = null
        );
        Task<AuctionResponseDto?> GetByIdAsync(int id);
        Task<Auction> CreateAsync(int sellerId, AuctionCreateDto dto);
        Task CloseAuctionAsync(int id);
        Task<AuctionResponseDto?> UpdateAsync(int id, AuctionUpdateDto dto, int userId, bool isAdmin);
        Task<bool> DeleteAsync(int id, int userId, bool isAdmin);
        Task<IEnumerable<AuctionListDto>> GetUserAuctionsAsync(int userId);
    }
}
