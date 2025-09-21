namespace AuctionHouse.Api.Models
{
    public class Transaction
    {
        public int Id { get; set; }

        // Related auction
        public int AuctionId { get; set; }
        public Auction Auction { get; set; } = null!;

        // Buyer who paid
        public int BuyerId { get; set; }
        public User Buyer { get; set; } = null!;

        public decimal Amount { get; set; }

        // e.g., "Pending", "Paid", "Failed"
        public string PaymentStatus { get; set; } = "Pending";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
