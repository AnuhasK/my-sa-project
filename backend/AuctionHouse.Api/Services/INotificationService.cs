using AuctionHouse.Api.DTOs;
using AuctionHouse.Api.Models;

namespace AuctionHouse.Api.Services
{
    public interface INotificationService
    {
        Task<Notification> CreateNotificationAsync(int userId, NotificationType type, string title, string? message = null, int? relatedEntityId = null, string? metadata = null);
        Task<IEnumerable<NotificationDto>> GetUserNotificationsAsync(int userId, bool? unreadOnly = null, int pageNumber = 1, int pageSize = 20);
        Task<int> GetUnreadCountAsync(int userId);
        Task<bool> MarkAsReadAsync(int notificationId, int userId);
        Task<bool> MarkAllAsReadAsync(int userId);
        Task<bool> DeleteNotificationAsync(int notificationId, int userId);
    }
}
