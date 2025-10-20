using AuctionHouse.Api.Data;
using AuctionHouse.Api.DTOs;
using AuctionHouse.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace AuctionHouse.Api.Services
{
    public class AdminService : IAdminService
    {
        private readonly ApplicationDbContext _db;
        private readonly ILogger<AdminService> _logger;

        public AdminService(ApplicationDbContext db, ILogger<AdminService> logger)
        {
            _db = db;
            _logger = logger;
        }

        public async Task<DashboardStatsDto> GetDashboardStatsAsync()
        {
            var now = DateTime.UtcNow;
            var today = now.Date;

            var stats = new DashboardStatsDto
            {
                TotalUsers = await _db.Users.CountAsync(),
                TotalAuctions = await _db.Auctions.CountAsync(),
                ActiveAuctions = await _db.Auctions.CountAsync(a => a.Status == "Open"),
                TotalBids = await _db.Bids.CountAsync(),
                TotalTransactions = await _db.Transactions.CountAsync(),
                TotalRevenue = await _db.Transactions.Where(t => t.PaymentStatus == "Paid").SumAsync(t => (decimal?)t.Amount) ?? 0,
                NewUsersToday = await _db.Users.CountAsync(u => u.CreatedAt >= today),
                NewAuctionsToday = await _db.Auctions.CountAsync(a => a.CreatedAt >= today),
                AverageAuctionPrice = await _db.Auctions.AverageAsync(a => (decimal?)a.CurrentPrice) ?? 0
            };

            // Get recent activity
            var recentBids = await _db.Bids
                .Include(b => b.Auction)
                .Include(b => b.Bidder)
                .OrderByDescending(b => b.Timestamp)
                .Take(5)
                .Select(b => new RecentActivityDto
                {
                    Type = "bid",
                    Description = $"{b.Bidder.Username} bid ${b.Amount} on {b.Auction.Title}",
                    Timestamp = b.Timestamp
                })
                .ToListAsync();

            var recentAuctions = await _db.Auctions
                .Include(a => a.Seller)
                .OrderByDescending(a => a.CreatedAt)
                .Take(5)
                .Select(a => new RecentActivityDto
                {
                    Type = "auction",
                    Description = $"{a.Seller.Username} created auction: {a.Title}",
                    Timestamp = a.CreatedAt
                })
                .ToListAsync();

            stats.RecentActivity = recentBids.Concat(recentAuctions)
                .OrderByDescending(a => a.Timestamp)
                .Take(10)
                .ToList();

            return stats;
        }

        public async Task<IEnumerable<AdminUserDto>> GetAllUsersAsync(int pageNumber = 1, int pageSize = 50, string? searchTerm = null)
        {
            var query = _db.Users.AsQueryable();

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                var search = searchTerm.ToLower();
                query = query.Where(u => 
                    u.Username.ToLower().Contains(search) || 
                    u.Email.ToLower().Contains(search));
            }

            var users = await query
                .OrderByDescending(u => u.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(u => new AdminUserDto
                {
                    Id = u.Id,
                    Username = u.Username,
                    Email = u.Email,
                    Role = u.Role,
                    CreatedAt = u.CreatedAt,
                    IsActive = u.IsActive,
                    AuctionsCreated = _db.Auctions.Count(a => a.SellerId == u.Id),
                    BidsPlaced = _db.Bids.Count(b => b.BidderId == u.Id),
                    AuctionsWon = _db.Transactions.Count(t => t.BuyerId == u.Id && t.PaymentStatus == "Paid")
                })
                .ToListAsync();

            return users;
        }

        public async Task<AdminUserDetailsDto?> GetUserDetailsAsync(int userId)
        {
            var user = await _db.Users.FindAsync(userId);
            if (user == null) return null;

            var userDetails = new AdminUserDetailsDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                Role = user.Role,
                CreatedAt = user.CreatedAt,
                IsActive = user.IsActive,
                AuctionsCreated = await _db.Auctions.CountAsync(a => a.SellerId == userId),
                BidsPlaced = await _db.Bids.CountAsync(b => b.BidderId == userId),
                AuctionsWon = await _db.Transactions.CountAsync(t => t.BuyerId == userId && t.PaymentStatus == "Paid")
            };

            // Get recent auctions
            userDetails.RecentAuctions = await _db.Auctions
                .Where(a => a.SellerId == userId)
                .OrderByDescending(a => a.CreatedAt)
                .Take(5)
                .Select(a => new AuctionListDto
                {
                    Id = a.Id,
                    Title = a.Title,
                    CurrentPrice = a.CurrentPrice,
                    Status = a.Status,
                    EndTime = a.EndTime
                })
                .ToListAsync();

            // Get recent bids
            userDetails.RecentBids = await _db.Bids
                .Include(b => b.Auction)
                .Where(b => b.BidderId == userId)
                .OrderByDescending(b => b.Timestamp)
                .Take(5)
                .Select(b => new BidDto
                {
                    Id = b.Id,
                    AuctionId = b.AuctionId,
                    AuctionTitle = b.Auction.Title,
                    BidderId = b.BidderId,
                    BidderName = user.Username,
                    Amount = b.Amount,
                    Timestamp = b.Timestamp,
                    IsWinning = false
                })
                .ToListAsync();

            // Get recent transactions
            userDetails.RecentTransactions = await _db.Transactions
                .Include(t => t.Auction)
                .Where(t => t.BuyerId == userId)
                .OrderByDescending(t => t.CreatedAt)
                .Take(5)
                .Select(t => new TransactionDto
                {
                    Id = t.Id,
                    AuctionId = t.AuctionId,
                    AuctionTitle = t.Auction.Title,
                    BuyerId = t.BuyerId,
                    Amount = t.Amount,
                    PaymentStatus = t.PaymentStatus,
                    CreatedAt = t.CreatedAt
                })
                .ToListAsync();

            return userDetails;
        }

        public async Task<bool> SuspendUserAsync(int userId, string reason)
        {
            var user = await _db.Users.FindAsync(userId);
            if (user == null) return false;

            user.IsActive = false;
            await _db.SaveChangesAsync();

            _logger.LogInformation($"User {userId} suspended. Reason: {reason}");

            return true;
        }

        public async Task<bool> ActivateUserAsync(int userId)
        {
            var user = await _db.Users.FindAsync(userId);
            if (user == null) return false;

            user.IsActive = true;
            await _db.SaveChangesAsync();

            _logger.LogInformation($"User {userId} activated");

            return true;
        }

        public async Task<bool> DeleteUserAsync(int userId)
        {
            var user = await _db.Users.FindAsync(userId);
            if (user == null) return false;

            // Hard delete - permanently remove from database
            _db.Users.Remove(user);
            await _db.SaveChangesAsync();

            _logger.LogInformation($"User {userId} permanently deleted");

            return true;
        }

        public async Task<int> CreateUserAsync(CreateUserDto dto)
        {
            // Check if username or email already exists
            var existingUser = await _db.Users
                .FirstOrDefaultAsync(u => u.Username == dto.Username || u.Email == dto.Email);
            
            if (existingUser != null)
            {
                return 0; // User already exists
            }

            // Hash the password
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            var user = new User
            {
                Username = dto.Username,
                Email = dto.Email,
                PasswordHash = passwordHash,
                Role = dto.Role,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            _logger.LogInformation($"User {user.Id} created by admin");

            return user.Id;
        }

        public async Task<bool> UpdateUserRoleAsync(int userId, string role)
        {
            var user = await _db.Users.FindAsync(userId);
            if (user == null) return false;

            // Validate role - only "User" or "Admin" allowed
            if (role != "Admin" && role != "User")
            {
                return false;
            }

            user.Role = role;
            await _db.SaveChangesAsync();

            _logger.LogInformation($"User {userId} role updated to {role}");

            return true;
        }

        public async Task<IEnumerable<AuctionListDto>> GetFlaggedAuctionsAsync()
        {
            // For now, return auctions that might need attention
            // In production, you'd have a "Flagged" or "ReportCount" field
            var flaggedAuctions = await _db.Auctions
                .Where(a => a.Status == "Deleted") // Use deleted as proxy for flagged
                .OrderByDescending(a => a.CreatedAt)
                .Take(50)
                .Select(a => new AuctionListDto
                {
                    Id = a.Id,
                    Title = a.Title,
                    CurrentPrice = a.CurrentPrice,
                    Status = a.Status,
                    EndTime = a.EndTime
                })
                .ToListAsync();

            return flaggedAuctions;
        }

        public async Task<bool> RemoveAuctionAsync(int auctionId, string reason)
        {
            var auction = await _db.Auctions.FindAsync(auctionId);
            if (auction == null) return false;

            auction.Status = "Deleted";
            await _db.SaveChangesAsync();

            _logger.LogInformation($"Auction {auctionId} removed by admin. Reason: {reason}");

            return true;
        }

        public async Task<bool> UpdateAuctionStatusAsync(int auctionId, string status)
        {
            var auction = await _db.Auctions.FindAsync(auctionId);
            if (auction == null) return false;

            // Validate status
            var validStatuses = new[] { "Open", "Pending", "Closed", "Sold", "Suspended" };
            if (!validStatuses.Contains(status))
            {
                return false;
            }

            auction.Status = status;
            await _db.SaveChangesAsync();

            _logger.LogInformation($"Auction {auctionId} status changed to {status} by admin");

            return true;
        }
    }
}
