using AuctionHouse.Api.DTOs;

namespace AuctionHouse.Api.Services
{
    public interface IAuthService
    {
        Task<AuthResponseDto> RegisterAsync(AuthRegisterDto dto);
        Task<AuthResponseDto> LoginAsync(AuthLoginDto dto);
        Task<UserProfileDto?> GetCurrentUserAsync(int userId);
        Task<UserProfileDto?> UpdateProfileAsync(int userId, UpdateProfileDto dto);
        Task<bool> UpdateProfileImageAsync(int userId, string imageUrl);
        Task<bool> ChangePasswordAsync(int userId, ChangePasswordDto dto);
        Task LogoutAsync(string token, int userId);
    }
}
