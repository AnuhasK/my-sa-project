namespace AuctionHouse.Api.DTOs
{
    public class ActivityLogDto
    {
        public int Id { get; set; }
        public string Type { get; set; } = null!;
        public string Message { get; set; } = null!;
        public string Severity { get; set; } = "info";
        public DateTime CreatedAt { get; set; }
        public string TimeAgo { get; set; } = null!;
    }

    public class CreateActivityLogDto
    {
        public string Type { get; set; } = null!;
        public string Message { get; set; } = null!;
        public string Severity { get; set; } = "info";
        public int? UserId { get; set; }
        public int? AuctionId { get; set; }
        public string? Metadata { get; set; }
    }
}
