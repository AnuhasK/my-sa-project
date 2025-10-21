namespace AuctionHouse.Api.DTOs
{
    public class RevenueDataDto
    {
        public string Month { get; set; } = string.Empty;
        public decimal Revenue { get; set; }
        public int Auctions { get; set; }
    }

    public class UserGrowthDto
    {
        public string Month { get; set; } = string.Empty;
        public int Users { get; set; }
    }

    public class CategoryDistributionDto
    {
        public string Name { get; set; } = string.Empty;
        public int Value { get; set; }
        public string Color { get; set; } = string.Empty;
    }

    public class TopAuctionDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Seller { get; set; } = string.Empty;
        public decimal FinalBid { get; set; }
        public int Bids { get; set; }
        public string Category { get; set; } = string.Empty;
    }

    public class AnalyticsStatsDto
    {
        public decimal TotalRevenue { get; set; }
        public string TotalRevenueFormatted => $"${TotalRevenue:N0}";
        public decimal RevenueChange { get; set; }
        
        public int CompletedAuctions { get; set; }
        public decimal AuctionsChange { get; set; }
        
        public int ActiveUsers { get; set; }
        public decimal UsersChange { get; set; }
        
        public decimal AverageBidValue { get; set; }
        public string AverageBidValueFormatted => $"${AverageBidValue:N0}";
        public decimal BidValueChange { get; set; }
    }
}
