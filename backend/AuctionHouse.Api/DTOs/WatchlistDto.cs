namespace AuctionHouse.Api.DTOs
{
    public class WatchlistDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int AuctionId { get; set; }
        public DateTime AddedDate { get; set; }
    }

    public class WatchlistAuctionDto
    {
        public int Id { get; set; }
        public int AuctionId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal CurrentBid { get; set; }
        public DateTime EndDate { get; set; }
        public string? ImageUrl { get; set; }
        public string? CategoryName { get; set; }
        public string Status { get; set; } = string.Empty;
        public int TotalBids { get; set; }
        public DateTime AddedToWatchlistDate { get; set; }
        public bool IsEnding { get; set; } // True if ending within 24 hours
    }
}
