using System.ComponentModel.DataAnnotations;

namespace AuctionHouse.Api.Models
{
    public class ActivityLog
    {
        public int Id { get; set; }
        
        [Required]
        public string Type { get; set; } = null!; // user-registered, auction-ended, dispute-reported, etc.
        
        [Required]
        public string Message { get; set; } = null!;
        
        public string Severity { get; set; } = "info"; // info, success, warning, error
        
        public int? UserId { get; set; }
        public User? User { get; set; }
        
        public int? AuctionId { get; set; }
        public Auction? Auction { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public string? Metadata { get; set; } // JSON string for additional data
    }
}
