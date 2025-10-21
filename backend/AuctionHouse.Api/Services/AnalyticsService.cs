using AuctionHouse.Api.Data;
using AuctionHouse.Api.DTOs;
using AuctionHouse.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace AuctionHouse.Api.Services
{
    public interface IAnalyticsService
    {
        Task<List<RevenueDataDto>> GetRevenueDataAsync(int months = 9);
        Task<List<UserGrowthDto>> GetUserGrowthDataAsync(int months = 9);
        Task<List<CategoryDistributionDto>> GetCategoryDistributionAsync();
        Task<List<TopAuctionDto>> GetTopPerformingAuctionsAsync(int count = 5);
        Task<AnalyticsStatsDto> GetAnalyticsStatsAsync();
    }

    public class AnalyticsService : IAnalyticsService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<AnalyticsService> _logger;

        public AnalyticsService(ApplicationDbContext context, ILogger<AnalyticsService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<List<RevenueDataDto>> GetRevenueDataAsync(int months = 9)
        {
            var startDate = DateTime.UtcNow.AddMonths(-months);
            
            // Get revenue data grouped by month
            var revenueData = await _context.Transactions
                .Where(t => t.CreatedAt >= startDate && t.PaymentStatus == PaymentStatus.Completed)
                .GroupBy(t => new { t.CreatedAt.Year, t.CreatedAt.Month })
                .Select(g => new
                {
                    Year = g.Key.Year,
                    Month = g.Key.Month,
                    Revenue = g.Sum(t => t.Amount),
                    Auctions = g.Select(t => t.AuctionId).Distinct().Count()
                })
                .OrderBy(g => g.Year).ThenBy(g => g.Month)
                .ToListAsync();

            return revenueData.Select(r => new RevenueDataDto
            {
                Month = new DateTime(r.Year, r.Month, 1, 0, 0, 0, DateTimeKind.Utc).ToString("MMM"),
                Revenue = r.Revenue,
                Auctions = r.Auctions
            }).ToList();
        }

        public async Task<List<UserGrowthDto>> GetUserGrowthDataAsync(int months = 9)
        {
            var startDate = DateTime.UtcNow.AddMonths(-months);
            
            // Get cumulative user count per month
            var monthlyData = new List<UserGrowthDto>();
            var currentDate = startDate;

            while (currentDate <= DateTime.UtcNow)
            {
                var userCount = await _context.Users
                    .Where(u => u.CreatedAt <= currentDate.AddMonths(1).AddDays(-1))
                    .CountAsync();

                monthlyData.Add(new UserGrowthDto
                {
                    Month = currentDate.ToString("MMM"),
                    Users = userCount
                });

                currentDate = currentDate.AddMonths(1);
            }

            return monthlyData;
        }

        public async Task<List<CategoryDistributionDto>> GetCategoryDistributionAsync()
        {
            var colors = new[] { "#374151", "#6B7280", "#9CA3AF", "#D1D5DB", "#E5E7EB" };
            
            var categoryData = await _context.Auctions
                .Where(a => a.Status != "Deleted")
                .GroupBy(a => a.CategoryId)
                .Select(g => new
                {
                    CategoryId = g.Key,
                    Count = g.Count()
                })
                .OrderByDescending(c => c.Count)
                .Take(5)
                .ToListAsync();

            var result = new List<CategoryDistributionDto>();
            var colorIndex = 0;

            foreach (var item in categoryData)
            {
                var category = await _context.Categories.FindAsync(item.CategoryId);
                result.Add(new CategoryDistributionDto
                {
                    Name = category?.Name ?? "Unknown",
                    Value = item.Count,
                    Color = colors[colorIndex % colors.Length]
                });
                colorIndex++;
            }

            return result;
        }

        public async Task<List<TopAuctionDto>> GetTopPerformingAuctionsAsync(int count = 5)
        {
            var topAuctions = await _context.Auctions
                .Where(a => a.Status == "Sold" || a.Status == "Closed")
                .Include(a => a.Category)
                .Include(a => a.Seller)
                .Include(a => a.Bids)
                .OrderByDescending(a => a.CurrentPrice)
                .Take(count)
                .Select(a => new TopAuctionDto
                {
                    Id = a.Id,
                    Title = a.Title,
                    Seller = a.Seller != null ? a.Seller.Username : "Unknown",
                    FinalBid = a.CurrentPrice,
                    Bids = a.Bids.Count,
                    Category = a.Category != null ? a.Category.Name : "Uncategorized"
                })
                .ToListAsync();

            return topAuctions;
        }

        public async Task<AnalyticsStatsDto> GetAnalyticsStatsAsync()
        {
            var now = DateTime.UtcNow;
            var lastMonth = now.AddMonths(-1);
            var twoMonthsAgo = now.AddMonths(-2);

            // Total Revenue
            var totalRevenue = await _context.Transactions
                .Where(t => t.PaymentStatus == PaymentStatus.Completed)
                .SumAsync(t => t.Amount);

            var lastMonthRevenue = await _context.Transactions
                .Where(t => t.PaymentStatus == PaymentStatus.Completed && t.CreatedAt >= lastMonth)
                .SumAsync(t => t.Amount);

            var previousMonthRevenue = await _context.Transactions
                .Where(t => t.PaymentStatus == PaymentStatus.Completed && t.CreatedAt >= twoMonthsAgo && t.CreatedAt < lastMonth)
                .SumAsync(t => t.Amount);

            var revenueChange = previousMonthRevenue > 0 
                ? ((lastMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 
                : 0;

            // Completed Auctions
            var completedAuctions = await _context.Auctions
                .Where(a => a.Status == "Sold" || a.Status == "Closed")
                .CountAsync();

            var lastMonthAuctions = await _context.Auctions
                .Where(a => (a.Status == "Sold" || a.Status == "Closed") && a.EndTime >= lastMonth)
                .CountAsync();

            var previousMonthAuctions = await _context.Auctions
                .Where(a => (a.Status == "Sold" || a.Status == "Closed") && 
                           a.EndTime >= twoMonthsAgo && a.EndTime < lastMonth)
                .CountAsync();

            var auctionsChange = previousMonthAuctions > 0 
                ? ((decimal)(lastMonthAuctions - previousMonthAuctions) / previousMonthAuctions) * 100 
                : 0;

            // Active Users
            var activeUsers = await _context.Users
                .Where(u => !u.DeletedAt.HasValue)
                .CountAsync();

            var lastMonthUsers = await _context.Users
                .Where(u => !u.DeletedAt.HasValue && u.CreatedAt >= lastMonth)
                .CountAsync();

            var previousMonthUsers = await _context.Users
                .Where(u => !u.DeletedAt.HasValue && u.CreatedAt >= twoMonthsAgo && u.CreatedAt < lastMonth)
                .CountAsync();

            var usersChange = previousMonthUsers > 0 
                ? ((decimal)(lastMonthUsers - previousMonthUsers) / previousMonthUsers) * 100 
                : 0;

            // Average Bid Value
            var totalBids = await _context.Bids.CountAsync();
            var totalBidAmount = await _context.Bids.SumAsync(b => b.Amount);
            var averageBidValue = totalBids > 0 ? totalBidAmount / totalBids : 0;

            var lastMonthBids = await _context.Bids
                .Where(b => b.Timestamp >= lastMonth)
                .ToListAsync();
            var lastMonthAvg = lastMonthBids.Any() ? lastMonthBids.Average(b => b.Amount) : 0;

            var previousMonthBids = await _context.Bids
                .Where(b => b.Timestamp >= twoMonthsAgo && b.Timestamp < lastMonth)
                .ToListAsync();
            var previousMonthAvg = previousMonthBids.Any() ? previousMonthBids.Average(b => b.Amount) : 0;

            var bidValueChange = previousMonthAvg > 0 
                ? ((lastMonthAvg - previousMonthAvg) / previousMonthAvg) * 100 
                : 0;

            return new AnalyticsStatsDto
            {
                TotalRevenue = totalRevenue,
                RevenueChange = revenueChange,
                CompletedAuctions = completedAuctions,
                AuctionsChange = auctionsChange,
                ActiveUsers = activeUsers,
                UsersChange = usersChange,
                AverageBidValue = averageBidValue,
                BidValueChange = bidValueChange
            };
        }
    }
}
