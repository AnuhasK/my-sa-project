using AuctionHouse.Api.DTOs;

namespace AuctionHouse.Api.Services
{
    public interface ITransactionService
    {
        /// <summary>
        /// Creates a transaction for a completed auction
        /// </summary>
        Task<ServiceResult<TransactionDto>> CreateTransactionAsync(int auctionId, int buyerId, decimal amount);

        /// <summary>
        /// Gets a transaction by ID
        /// </summary>
        Task<ServiceResult<TransactionDto>> GetTransactionByIdAsync(int transactionId, int userId);

        /// <summary>
        /// Gets all transactions for a buyer
        /// </summary>
        Task<ServiceResult<List<TransactionListDto>>> GetBuyerTransactionsAsync(int buyerId);

        /// <summary>
        /// Gets all transactions for a seller
        /// </summary>
        Task<ServiceResult<List<TransactionListDto>>> GetSellerTransactionsAsync(int sellerId);

        /// <summary>
        /// Updates the payment status of a transaction
        /// </summary>
        Task<ServiceResult> UpdatePaymentStatusAsync(int transactionId, string paymentStatus, int userId);

        /// <summary>
        /// Checks if a transaction exists for an auction
        /// </summary>
        Task<bool> TransactionExistsForAuctionAsync(int auctionId);
    }
}
