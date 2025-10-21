using AuctionHouse.Api.Data;
using AuctionHouse.Api.DTOs;
using AuctionHouse.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace AuctionHouse.Api.Services
{
    public interface IAnnouncementService
    {
        Task<Announcement> CreateAnnouncementAsync(CreateAnnouncementDto dto, int createdById);
        Task<List<AnnouncementDto>> GetAllAnnouncementsAsync();
        Task<AnnouncementDto?> GetAnnouncementByIdAsync(int id);
        Task<Announcement> SendAnnouncementAsync(int id);
        Task<bool> DeleteAnnouncementAsync(int id);
    }

    public class AnnouncementService : IAnnouncementService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<AnnouncementService> _logger;

        public AnnouncementService(ApplicationDbContext context, ILogger<AnnouncementService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<Announcement> CreateAnnouncementAsync(CreateAnnouncementDto dto, int createdById)
        {
            var announcement = new Announcement
            {
                Title = dto.Title,
                Message = dto.Message,
                Type = dto.Type,
                Recipients = dto.Recipients,
                CreatedById = createdById,
                ScheduledFor = dto.ScheduledFor,
                Status = dto.ScheduledFor.HasValue ? "scheduled" : "draft",
                CreatedAt = DateTime.UtcNow
            };

            _context.Announcements.Add(announcement);
            await _context.SaveChangesAsync();

            return announcement;
        }

        public async Task<List<AnnouncementDto>> GetAllAnnouncementsAsync()
        {
            var announcements = await _context.Announcements
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();

            return announcements.Select(a => new AnnouncementDto
            {
                Id = a.Id,
                Title = a.Title,
                Message = a.Message,
                Type = a.Type,
                Recipients = a.Recipients,
                Status = a.Status,
                CreatedAt = a.CreatedAt,
                SentAt = a.SentAt,
                SentTimeAgo = a.SentAt.HasValue ? GetTimeAgo(a.SentAt.Value) : "Not sent"
            }).ToList();
        }

        public async Task<AnnouncementDto?> GetAnnouncementByIdAsync(int id)
        {
            var announcement = await _context.Announcements.FindAsync(id);
            if (announcement == null) return null;

            return new AnnouncementDto
            {
                Id = announcement.Id,
                Title = announcement.Title,
                Message = announcement.Message,
                Type = announcement.Type,
                Recipients = announcement.Recipients,
                Status = announcement.Status,
                CreatedAt = announcement.CreatedAt,
                SentAt = announcement.SentAt,
                SentTimeAgo = announcement.SentAt.HasValue ? GetTimeAgo(announcement.SentAt.Value) : "Not sent"
            };
        }

        public async Task<Announcement> SendAnnouncementAsync(int id)
        {
            var announcement = await _context.Announcements.FindAsync(id);
            if (announcement == null)
                throw new ApplicationException("Announcement not found");

            announcement.Status = "sent";
            announcement.SentAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();

            // TODO: Actually send notifications to users here
            // This would create Notification entries for all matching users

            return announcement;
        }

        public async Task<bool> DeleteAnnouncementAsync(int id)
        {
            var announcement = await _context.Announcements.FindAsync(id);
            if (announcement == null) return false;

            _context.Announcements.Remove(announcement);
            await _context.SaveChangesAsync();

            return true;
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
