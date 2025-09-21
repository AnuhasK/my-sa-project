using AuctionHouse.Api.DTOs;

namespace AuctionHouse.Api.Services
{
    public interface IAuthService
    {
        Task<AuthResponseDto> RegisterAsync(AuthRegisterDto dto);
        Task<AuthResponseDto> LoginAsync(AuthLoginDto dto);
    }
}
