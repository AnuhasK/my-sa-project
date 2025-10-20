namespace AuctionHouse.Api.Models
{
    public class RevokedToken
    {
        public int Id { get; set; }
        public string Token { get; set; } = null!;
        public DateTime RevokedAt { get; set; }
        public DateTime ExpiresAt { get; set; }
        public int UserId { get; set; }
        public string? Reason { get; set; }
    }
}
