namespace AuctionHouse.Api.Models
{
    public class Bid
    {
        public int Id { get; set; }
        public int AuctionId { get; set; }
        public Auction Auction { get; set; } = null!;
        public int BidderId { get; set; }
        public User Bidder { get; set; } = null!;
        public decimal Amount { get; set; }
        public DateTime Timestamp { get; set; }
    }
}
