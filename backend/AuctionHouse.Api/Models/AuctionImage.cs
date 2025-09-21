namespace AuctionHouse.Api.Models
{
    public class AuctionImage
    {
        public int Id { get; set; }

        // Foreign key to Auction
        public int AuctionId { get; set; }

        // Navigation property (optional, helps with EF relationships)
        public Auction Auction { get; set; } = null!;

        // Image URL or file path
        public string Url { get; set; } = null!;
    }
}
