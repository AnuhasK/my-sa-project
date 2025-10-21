namespace AuctionHouse.Api.Models
{
    public enum PaymentStatus
    {
        Pending = 0,
        Paid = 1,
        Shipped = 2,
        Completed = 3,
        Cancelled = 4
    }

    public class Transaction
    {
        public int Id { get; set; }

        // Related auction (managed by admin)
        public int AuctionId { get; set; }
        public Auction Auction { get; set; } = null!;

        // Winner/Buyer who won the auction
        public int BuyerId { get; set; }
        public User Buyer { get; set; } = null!;

        // Final winning bid amount
        public decimal Amount { get; set; }

        // Payment status tracking
        public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Pending;

        // Order dates
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;
        public DateTime? PaidDate { get; set; }
        public DateTime? ShippedDate { get; set; }
        public DateTime? CompletedDate { get; set; }

        // Shipping information
        public string? ShippingAddress { get; set; }
        public string? TrackingNumber { get; set; }
        public string? ShippingMethod { get; set; }

        // Additional details
        public string? BuyerNotes { get; set; }
        public string? AdminNotes { get; set; }  // Admin (seller) notes

        // Timestamps
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}
