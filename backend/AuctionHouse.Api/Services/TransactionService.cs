using AuctionHouse.Api.Data;
using AuctionHouse.Api.DTOs;
using AuctionHouse.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace AuctionHouse.Api.Services
{
    public class TransactionService : ITransactionService
    {
        private readonly ApplicationDbContext _db;

        public TransactionService(ApplicationDbContext db)
        {
            _db = db;
        }

        public async Task<ServiceResult<TransactionDto>> CreateTransactionAsync(int auctionId, int buyerId, decimal amount)
        {
            try
            {
                // Check if transaction already exists
                var existingTransaction = await _db.Transactions
                    .FirstOrDefaultAsync(t => t.AuctionId == auctionId);

                if (existingTransaction != null)
                {
                    return ServiceResult<TransactionDto>.Failure("Transaction already exists for this auction");
                }

                // Verify auction exists and is closed
                var auction = await _db.Auctions
                    .Include(a => a.Seller)
                    .FirstOrDefaultAsync(a => a.Id == auctionId);

                if (auction == null)
                {
                    return ServiceResult<TransactionDto>.Failure("Auction not found");
                }

                if (auction.Status != "Closed")
                {
                    return ServiceResult<TransactionDto>.Failure("Auction is not closed yet");
                }

                // Verify buyer exists
                var buyer = await _db.Users.FirstOrDefaultAsync(u => u.Id == buyerId);
                if (buyer == null)
                {
                    return ServiceResult<TransactionDto>.Failure("Buyer not found");
                }

                // Create transaction
                var transaction = new Transaction
                {
                    AuctionId = auctionId,
                    BuyerId = buyerId,
                    Amount = amount,
                    PaymentStatus = "Pending",
                    CreatedAt = DateTime.UtcNow
                };

                _db.Transactions.Add(transaction);
                await _db.SaveChangesAsync();

                // Return DTO
                var dto = new TransactionDto
                {
                    Id = transaction.Id,
                    AuctionId = auction.Id,
                    AuctionTitle = auction.Title,
                    BuyerId = buyer.Id,
                    BuyerUsername = buyer.Username,
                    BuyerEmail = buyer.Email,
                    SellerId = auction.SellerId,
                    SellerUsername = auction.Seller.Username,
                    SellerEmail = auction.Seller.Email,
                    Amount = transaction.Amount,
                    PaymentStatus = transaction.PaymentStatus,
                    CreatedAt = transaction.CreatedAt
                };

                return ServiceResult<TransactionDto>.Success(dto);
            }
            catch (Exception ex)
            {
                return ServiceResult<TransactionDto>.Failure($"Error creating transaction: {ex.Message}");
            }
        }

        public async Task<ServiceResult<TransactionDto>> GetTransactionByIdAsync(int transactionId, int userId)
        {
            try
            {
                var transaction = await _db.Transactions
                    .Include(t => t.Auction)
                        .ThenInclude(a => a.Seller)
                    .Include(t => t.Buyer)
                    .FirstOrDefaultAsync(t => t.Id == transactionId);

                if (transaction == null)
                {
                    return ServiceResult<TransactionDto>.Failure("Transaction not found");
                }

                // Check authorization - user must be buyer or seller
                if (transaction.BuyerId != userId && transaction.Auction.SellerId != userId)
                {
                    return ServiceResult<TransactionDto>.Failure("Unauthorized to view this transaction");
                }

                var dto = new TransactionDto
                {
                    Id = transaction.Id,
                    AuctionId = transaction.AuctionId,
                    AuctionTitle = transaction.Auction.Title,
                    BuyerId = transaction.BuyerId,
                    BuyerUsername = transaction.Buyer.Username,
                    BuyerEmail = transaction.Buyer.Email,
                    SellerId = transaction.Auction.SellerId,
                    SellerUsername = transaction.Auction.Seller.Username,
                    SellerEmail = transaction.Auction.Seller.Email,
                    Amount = transaction.Amount,
                    PaymentStatus = transaction.PaymentStatus,
                    CreatedAt = transaction.CreatedAt
                };

                return ServiceResult<TransactionDto>.Success(dto);
            }
            catch (Exception ex)
            {
                return ServiceResult<TransactionDto>.Failure($"Error retrieving transaction: {ex.Message}");
            }
        }

        public async Task<ServiceResult<List<TransactionListDto>>> GetBuyerTransactionsAsync(int buyerId)
        {
            try
            {
                var transactions = await _db.Transactions
                    .Include(t => t.Auction)
                        .ThenInclude(a => a.Seller)
                    .Where(t => t.BuyerId == buyerId)
                    .OrderByDescending(t => t.CreatedAt)
                    .Select(t => new TransactionListDto
                    {
                        Id = t.Id,
                        AuctionId = t.AuctionId,
                        AuctionTitle = t.Auction.Title,
                        OtherPartyUsername = t.Auction.Seller.Username, // Seller is the other party for buyer
                        Amount = t.Amount,
                        PaymentStatus = t.PaymentStatus,
                        CreatedAt = t.CreatedAt
                    })
                    .ToListAsync();

                return ServiceResult<List<TransactionListDto>>.Success(transactions);
            }
            catch (Exception ex)
            {
                return ServiceResult<List<TransactionListDto>>.Failure($"Error retrieving buyer transactions: {ex.Message}");
            }
        }

        public async Task<ServiceResult<List<TransactionListDto>>> GetSellerTransactionsAsync(int sellerId)
        {
            try
            {
                var transactions = await _db.Transactions
                    .Include(t => t.Auction)
                    .Include(t => t.Buyer)
                    .Where(t => t.Auction.SellerId == sellerId)
                    .OrderByDescending(t => t.CreatedAt)
                    .Select(t => new TransactionListDto
                    {
                        Id = t.Id,
                        AuctionId = t.AuctionId,
                        AuctionTitle = t.Auction.Title,
                        OtherPartyUsername = t.Buyer.Username, // Buyer is the other party for seller
                        Amount = t.Amount,
                        PaymentStatus = t.PaymentStatus,
                        CreatedAt = t.CreatedAt
                    })
                    .ToListAsync();

                return ServiceResult<List<TransactionListDto>>.Success(transactions);
            }
            catch (Exception ex)
            {
                return ServiceResult<List<TransactionListDto>>.Failure($"Error retrieving seller transactions: {ex.Message}");
            }
        }

        public async Task<ServiceResult> UpdatePaymentStatusAsync(int transactionId, string paymentStatus, int userId)
        {
            try
            {
                // Validate payment status
                var validStatuses = new[] { "Pending", "Paid", "Failed", "Refunded" };
                if (!validStatuses.Contains(paymentStatus))
                {
                    return ServiceResult.Failure($"Invalid payment status. Must be one of: {string.Join(", ", validStatuses)}");
                }

                var transaction = await _db.Transactions
                    .Include(t => t.Auction)
                    .FirstOrDefaultAsync(t => t.Id == transactionId);

                if (transaction == null)
                {
                    return ServiceResult.Failure("Transaction not found");
                }

                // Only buyer or seller can update payment status
                if (transaction.BuyerId != userId && transaction.Auction.SellerId != userId)
                {
                    return ServiceResult.Failure("Unauthorized to update this transaction");
                }

                transaction.PaymentStatus = paymentStatus;
                await _db.SaveChangesAsync();

                return ServiceResult.Success();
            }
            catch (Exception ex)
            {
                return ServiceResult.Failure($"Error updating payment status: {ex.Message}");
            }
        }

        public async Task<bool> TransactionExistsForAuctionAsync(int auctionId)
        {
            return await _db.Transactions.AnyAsync(t => t.AuctionId == auctionId);
        }
    }
}
