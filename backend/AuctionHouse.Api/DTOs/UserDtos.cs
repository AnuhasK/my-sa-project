namespace AuctionHouse.Api.DTOs
{
    public class UserStatsDto
    {
        public int TotalBids { get; set; }
        public int ActiveBids { get; set; }
        public int WonAuctions { get; set; }
        public int ActiveAuctions { get; set; }
        public decimal TotalSpent { get; set; }
        public int WatchlistCount { get; set; }
    }
}
