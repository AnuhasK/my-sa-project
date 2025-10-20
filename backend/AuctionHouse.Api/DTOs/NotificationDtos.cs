using AuctionHouse.Api.Models;

namespace AuctionHouse.Api.DTOs
{
    public class NotificationDto
    {
        public int Id { get; set; }
        public string Type { get; set; } = null!;
        public string Title { get; set; } = null!;
        public string? Message { get; set; }
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
        public int? RelatedEntityId { get; set; }
        public string? Metadata { get; set; }
    }

    public class NotificationCreateDto
    {
        public int UserId { get; set; }
        public NotificationType Type { get; set; }
        public string Title { get; set; } = null!;
        public string? Message { get; set; }
        public int? RelatedEntityId { get; set; }
        public string? Metadata { get; set; }
    }

    public class UnreadCountDto
    {
        public int Count { get; set; }
    }
}
