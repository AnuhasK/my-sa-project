namespace AuctionHouse.Api.DTOs
{
    public class BidCreateDto 
    { 
        public int AuctionId { get; set; } 
        public decimal Amount { get; set; } 
    }

    public class BidDto
    {
        public int Id { get; set; }
        public int AuctionId { get; set; }
        public string AuctionTitle { get; set; } = null!;
        public int BidderId { get; set; }
        public string BidderName { get; set; } = null!;
        public decimal Amount { get; set; }
        public DateTime Timestamp { get; set; }
        public bool IsWinning { get; set; }
    }
}
