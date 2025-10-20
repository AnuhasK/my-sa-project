namespace AuctionHouse.Api.DTOs
{
    public class AuctionCreateDto 
    { 
        public string Title { get; set; } = null!; 
        public string Description { get; set; } = null!; 
        public decimal StartPrice { get; set; } 
        public DateTime StartTime { get; set; } 
        public DateTime EndTime { get; set; } 
        public int CategoryId { get; set; }
    }

    public class AuctionUpdateDto
    {
        public string Title { get; set; } = null!;
        public string Description { get; set; } = null!;
        public DateTime EndTime { get; set; }
        public int CategoryId { get; set; }
    }

    public class AuctionResponseDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = null!;
        public string Description { get; set; } = null!;
        public decimal StartPrice { get; set; }
        public decimal CurrentPrice { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public int SellerId { get; set; }
        public string Status { get; set; } = null!;
        public string CategoryName { get; set; } = null!;
        public int CategoryId { get; set; }
        public List<string> ImageUrls { get; set; } = new();
        public int BidCount { get; set; }
    }

    public class AuctionListDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = null!;
        public string Description { get; set; } = null!;
        public decimal CurrentPrice { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string Status { get; set; } = null!;
        public string CategoryName { get; set; } = null!;
        public int CategoryId { get; set; }
        public string? PrimaryImageUrl { get; set; }
        public int BidCount { get; set; }
    }
}
