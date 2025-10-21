using System.ComponentModel.DataAnnotations;

namespace AuctionHouse.Api.Models
{
    public class Announcement
    {
        public int Id { get; set; }
        
        [Required]
        public string Title { get; set; } = null!;
        
        [Required]
        public string Message { get; set; } = null!;
        
        public string Type { get; set; } = "info"; // info, success, warning, error
        
        public string Recipients { get; set; } = "all"; // all, buyers, sellers, etc.
        
        public int CreatedById { get; set; }
        public User CreatedBy { get; set; } = null!;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? ScheduledFor { get; set; }
        
        public string Status { get; set; } = "draft"; // draft, sent, scheduled
        
        public DateTime? SentAt { get; set; }
    }
}
