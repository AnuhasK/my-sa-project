using AuctionHouse.Api.DTOs;

namespace AuctionHouse.Api.Services
{
    public interface IAdminService
    {
        Task<DashboardStatsDto> GetDashboardStatsAsync();
        Task<IEnumerable<AdminUserDto>> GetAllUsersAsync(int pageNumber = 1, int pageSize = 50, string? searchTerm = null);
        Task<AdminUserDetailsDto?> GetUserDetailsAsync(int userId);
        Task<bool> SuspendUserAsync(int userId, string reason);
        Task<bool> ActivateUserAsync(int userId);
        Task<bool> DeleteUserAsync(int userId);
        Task<int> CreateUserAsync(CreateUserDto dto);
        Task<bool> UpdateUserRoleAsync(int userId, string role);
        Task<IEnumerable<AuctionListDto>> GetFlaggedAuctionsAsync();
        Task<bool> RemoveAuctionAsync(int auctionId, string reason);
    }
}
