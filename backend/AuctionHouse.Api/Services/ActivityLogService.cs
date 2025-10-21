using AuctionHouse.Api.Data;
using AuctionHouse.Api.DTOs;
using AuctionHouse.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace AuctionHouse.Api.Services
{
    public interface IActivityLogService
    {
        Task<ActivityLog> LogActivityAsync(CreateActivityLogDto dto);
        Task<List<ActivityLogDto>> GetRecentActivityAsync(int count = 20);
    }

    public class ActivityLogService : IActivityLogService
    {
        private readonly ApplicationDbContext _context;

        public ActivityLogService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ActivityLog> LogActivityAsync(CreateActivityLogDto dto)
        {
            var activityLog = new ActivityLog
            {
                Type = dto.Type,
                Message = dto.Message,
                Severity = dto.Severity,
                UserId = dto.UserId,
                AuctionId = dto.AuctionId,
                Metadata = dto.Metadata,
                CreatedAt = DateTime.UtcNow
            };

            _context.ActivityLogs.Add(activityLog);
            await _context.SaveChangesAsync();

            return activityLog;
        }

        public async Task<List<ActivityLogDto>> GetRecentActivityAsync(int count = 20)
        {
            var activities = await _context.ActivityLogs
                .OrderByDescending(a => a.CreatedAt)
                .Take(count)
                .ToListAsync();

            return activities.Select(a => new ActivityLogDto
            {
                Id = a.Id,
                Type = a.Type,
                Message = a.Message,
                Severity = a.Severity,
                CreatedAt = a.CreatedAt,
                TimeAgo = GetTimeAgo(a.CreatedAt)
            }).ToList();
        }

        private string GetTimeAgo(DateTime dateTime)
        {
            var timeSpan = DateTime.UtcNow - dateTime;

            if (timeSpan.TotalMinutes < 1)
                return "just now";
            if (timeSpan.TotalMinutes < 60)
                return $"{(int)timeSpan.TotalMinutes} minute{((int)timeSpan.TotalMinutes != 1 ? "s" : "")} ago";
            if (timeSpan.TotalHours < 24)
                return $"{(int)timeSpan.TotalHours} hour{((int)timeSpan.TotalHours != 1 ? "s" : "")} ago";
            if (timeSpan.TotalDays < 7)
                return $"{(int)timeSpan.TotalDays} day{((int)timeSpan.TotalDays != 1 ? "s" : "")} ago";
            if (timeSpan.TotalDays < 30)
                return $"{(int)(timeSpan.TotalDays / 7)} week{((int)(timeSpan.TotalDays / 7) != 1 ? "s" : "")} ago";
            
            return dateTime.ToString("MMM dd, yyyy");
        }
    }
}
