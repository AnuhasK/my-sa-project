namespace AuctionHouse.Api.DTOs
{
    public class AuctionCreateDto { public string Title { get; set; } = null!; public string Description { get; set; } = null!; public decimal StartPrice { get; set; } public DateTime StartTime { get; set; } public DateTime EndTime { get; set; } }
}
