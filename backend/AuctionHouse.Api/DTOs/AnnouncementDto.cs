namespace AuctionHouse.Api.DTOs
{
    public class AnnouncementDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = null!;
        public string Message { get; set; } = null!;
        public string Type { get; set; } = "info";
        public string Recipients { get; set; } = "all";
        public string Status { get; set; } = "draft";
        public DateTime CreatedAt { get; set; }
        public DateTime? SentAt { get; set; }
        public string SentTimeAgo { get; set; } = null!;
    }

    public class CreateAnnouncementDto
    {
        public string Title { get; set; } = null!;
        public string Message { get; set; } = null!;
        public string Type { get; set; } = "info";
        public string Recipients { get; set; } = "all";
        public DateTime? ScheduledFor { get; set; }
    }

    public class SendAnnouncementDto
    {
        public int Id { get; set; }
    }
}
