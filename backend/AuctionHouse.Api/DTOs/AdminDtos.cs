namespace AuctionHouse.Api.DTOs
{
    public class DashboardStatsDto
    {
        public int TotalUsers { get; set; }
        public int TotalAuctions { get; set; }
        public int ActiveAuctions { get; set; }
        public int TotalBids { get; set; }
        public int TotalTransactions { get; set; }
        public decimal TotalRevenue { get; set; }
        public int NewUsersToday { get; set; }
        public int NewAuctionsToday { get; set; }
        public decimal AverageAuctionPrice { get; set; }
        public List<RecentActivityDto>? RecentActivity { get; set; }
    }

    public class RecentActivityDto
    {
        public string Type { get; set; } = null!; // "bid", "auction", "user", "transaction"
        public string Description { get; set; } = null!;
        public DateTime Timestamp { get; set; }
    }

    public class AdminUserDto
    {
        public int Id { get; set; }
        public string Username { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Role { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        public bool IsActive { get; set; }
        public int AuctionsCreated { get; set; }
        public int BidsPlaced { get; set; }
        public int AuctionsWon { get; set; }
    }

    public class AdminUserDetailsDto : AdminUserDto
    {
        public List<AuctionListDto>? RecentAuctions { get; set; }
        public List<BidDto>? RecentBids { get; set; }
        public List<TransactionDto>? RecentTransactions { get; set; }
    }

    public class UserActionDto
    {
        public string? Action { get; set; } // "suspend", "activate", "delete" (optional, inferred from endpoint)
        public string? Reason { get; set; }
    }

    public class CreateUserDto
    {
        public string Username { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
        public string Role { get; set; } = "User"; // Default role: "User" or "Admin"
    }

    public class UpdateRoleDto
    {
        public string Role { get; set; } = null!; // "User" or "Admin"
    }

    public class UpdateAuctionStatusDto
    {
        public string Status { get; set; } = null!; // "Open", "Pending", "Closed", "Sold", "Suspended"
    }
}
