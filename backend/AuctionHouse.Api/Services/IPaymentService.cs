using AuctionHouse.Api.DTOs;

namespace AuctionHouse.Api.Services
{
    public interface IPaymentService
    {
        Task<ServiceResult<string>> CreateCheckoutSessionAsync(int transactionId, int userId);
        Task<ServiceResult<bool>> HandleWebhookAsync(string payload, string signature);
    }
}
