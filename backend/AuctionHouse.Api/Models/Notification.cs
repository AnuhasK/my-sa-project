namespace AuctionHouse.Api.Models
{
    public enum NotificationType
    {
        BidPlaced,          // "New bid placed on your auction"
        BidOutbid,          // "You've been outbid on an auction"
        AuctionEnding,      // "Auction ending soon (1 hour warning)"
        AuctionWon,         // "Congratulations! You won the auction"
        AuctionLost,        // "Auction ended - you didn't win"
        TransactionCreated, // "Payment required for won auction"
        TransactionPaid,    // "Payment received/confirmed"
        AuctionCreated,     // "Your auction is now live"
        AuctionSold,        // "Your auction sold successfully"
        SystemMessage       // General system notifications
    }

    public class Notification
    {
        public int Id { get; set; }
        
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        
        public NotificationType Type { get; set; }
        
        public string Title { get; set; } = null!;
        
        public string? Message { get; set; }
        
        public bool IsRead { get; set; } = false;
        
        public DateTime CreatedAt { get; set; }
        
        // Optional: Link to related entity (auction, bid, transaction)
        public int? RelatedEntityId { get; set; }
        
        // Optional: Additional metadata as JSON
        public string? Metadata { get; set; }
    }
}
