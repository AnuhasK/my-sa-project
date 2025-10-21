using AuctionHouse.Api.Data;
using AuctionHouse.Api.DTOs;
using AuctionHouse.Api.Models;
using Microsoft.EntityFrameworkCore;
using Stripe;
using Stripe.Checkout;

namespace AuctionHouse.Api.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly ApplicationDbContext _db;
        private readonly IConfiguration _config;
        private readonly ILogger<PaymentService> _logger;

        public PaymentService(ApplicationDbContext db, IConfiguration config, ILogger<PaymentService> logger)
        {
            _db = db;
            _config = config;
            _logger = logger;
            
            // Set Stripe API key
            StripeConfiguration.ApiKey = _config["Stripe:SecretKey"];
        }

        public async Task<ServiceResult<string>> CreateCheckoutSessionAsync(int transactionId, int userId)
        {
            try
            {
                // Get transaction with auction details
                var transaction = await _db.Transactions
                    .Include(t => t.Auction)
                        .ThenInclude(a => a.Images)
                    .Include(t => t.Buyer)
                    .FirstOrDefaultAsync(t => t.Id == transactionId && t.BuyerId == userId);

                if (transaction == null)
                {
                    return ServiceResult<string>.Failure("Transaction not found or unauthorized");
                }

                if (transaction.PaymentStatus != PaymentStatus.Pending)
                {
                    return ServiceResult<string>.Failure("Transaction is not in pending status");
                }

                // Get the first image
                var imageUrl = transaction.Auction.Images
                    ?.OrderBy(i => i.DisplayOrder)
                    .FirstOrDefault()?.Url;

                // Convert relative URL to full URL if needed
                if (!string.IsNullOrEmpty(imageUrl) && !imageUrl.StartsWith("http"))
                {
                    var baseUrl = _config["AppSettings:BaseUrl"] ?? "http://localhost:5021";
                    imageUrl = $"{baseUrl}{imageUrl}";
                }

                // Create Stripe Checkout Session
                var options = new SessionCreateOptions
                {
                    PaymentMethodTypes = new List<string> { "card" },
                    LineItems = new List<SessionLineItemOptions>
                    {
                        new SessionLineItemOptions
                        {
                            PriceData = new SessionLineItemPriceDataOptions
                            {
                                Currency = "usd",
                                ProductData = new SessionLineItemPriceDataProductDataOptions
                                {
                                    Name = transaction.Auction.Title,
                                    Description = $"Auction #{transaction.AuctionId} - Won Item",
                                    Images = !string.IsNullOrEmpty(imageUrl) 
                                        ? new List<string> { imageUrl } 
                                        : null,
                                },
                                UnitAmount = (long)(transaction.Amount * 100), // Convert to cents
                            },
                            Quantity = 1,
                        },
                    },
                    Mode = "payment",
                    SuccessUrl = $"{_config["AppSettings:FrontendUrl"]}/payment-success?session_id={{CHECKOUT_SESSION_ID}}",
                    CancelUrl = $"{_config["AppSettings:FrontendUrl"]}/payment-cancelled",
                    ClientReferenceId = transactionId.ToString(),
                    CustomerEmail = transaction.Buyer.Email,
                    Metadata = new Dictionary<string, string>
                    {
                        { "transaction_id", transactionId.ToString() },
                        { "auction_id", transaction.AuctionId.ToString() },
                        { "buyer_id", userId.ToString() }
                    }
                };

                var service = new SessionService();
                var session = await service.CreateAsync(options);

                _logger.LogInformation($"Created Stripe checkout session {session.Id} for transaction {transactionId}");

                return ServiceResult<string>.Success(session.Url);
            }
            catch (StripeException ex)
            {
                _logger.LogError($"Stripe error: {ex.Message}");
                return ServiceResult<string>.Failure($"Payment processing error: {ex.Message}");
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error creating checkout session: {ex.Message}");
                return ServiceResult<string>.Failure($"Failed to create payment session: {ex.Message}");
            }
        }

        public async Task<ServiceResult<bool>> HandleWebhookAsync(string payload, string signature)
        {
            try
            {
                var webhookSecret = _config["Stripe:WebhookSecret"];
                var stripeEvent = EventUtility.ConstructEvent(
                    payload,
                    signature,
                    webhookSecret
                );

                _logger.LogInformation($"Received Stripe webhook: {stripeEvent.Type}");

                if (stripeEvent.Type == "checkout.session.completed")
                {
                    var session = stripeEvent.Data.Object as Session;
                    if (session == null) return ServiceResult<bool>.Failure("Invalid session data");

                    // Get transaction ID from metadata
                    if (!session.Metadata.TryGetValue("transaction_id", out var transactionIdStr) ||
                        !int.TryParse(transactionIdStr, out var transactionId))
                    {
                        _logger.LogWarning("Transaction ID not found in webhook metadata");
                        return ServiceResult<bool>.Failure("Transaction ID missing");
                    }

                    // Update transaction status
                    var transaction = await _db.Transactions
                        .Include(t => t.Buyer)
                        .Include(t => t.Auction)
                        .FirstOrDefaultAsync(t => t.Id == transactionId);

                    if (transaction == null)
                    {
                        _logger.LogWarning($"Transaction {transactionId} not found");
                        return ServiceResult<bool>.Failure("Transaction not found");
                    }

                    transaction.PaymentStatus = PaymentStatus.Paid;
                    transaction.PaidDate = DateTime.UtcNow;
                    transaction.UpdatedAt = DateTime.UtcNow;

                    // Create notification for buyer
                    var buyerNotification = new Models.Notification
                    {
                        UserId = transaction.BuyerId,
                        Type = NotificationType.TransactionPaid,
                        Title = "Payment Confirmed!",
                        Message = $"Your payment of ${transaction.Amount:F2} for '{transaction.Auction.Title}' has been received. Your item will be shipped soon.",
                        RelatedEntityId = transaction.AuctionId,
                        IsRead = false,
                        CreatedAt = DateTime.UtcNow
                    };
                    _db.Notifications.Add(buyerNotification);

                    // Create notification for admin
                    var adminUsers = await _db.Users.Where(u => u.Role == "Admin").ToListAsync();
                    foreach (var admin in adminUsers)
                    {
                        var adminNotification = new Models.Notification
                        {
                            UserId = admin.Id,
                            Type = NotificationType.TransactionPaid,
                            Title = "Payment Received",
                            Message = $"Payment of ${transaction.Amount:F2} received for auction '{transaction.Auction.Title}'. Prepare item for shipping.",
                            RelatedEntityId = transaction.AuctionId,
                            IsRead = false,
                            CreatedAt = DateTime.UtcNow
                        };
                        _db.Notifications.Add(adminNotification);
                    }

                    await _db.SaveChangesAsync();

                    _logger.LogInformation($"Transaction {transactionId} marked as paid");
                }

                return ServiceResult<bool>.Success(true);
            }
            catch (StripeException ex)
            {
                _logger.LogError($"Stripe webhook error: {ex.Message}");
                return ServiceResult<bool>.Failure($"Webhook processing error: {ex.Message}");
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error handling webhook: {ex.Message}");
                return ServiceResult<bool>.Failure($"Failed to process webhook: {ex.Message}");
            }
        }
    }
}
