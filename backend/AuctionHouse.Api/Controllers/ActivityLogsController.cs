using AuctionHouse.Api.DTOs;
using AuctionHouse.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuctionHouse.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ActivityLogsController : ControllerBase
    {
        private readonly IActivityLogService _activityLogService;
        private readonly ILogger<ActivityLogsController> _logger;

        public ActivityLogsController(
            IActivityLogService activityLogService,
            ILogger<ActivityLogsController> logger)
        {
            _activityLogService = activityLogService;
            _logger = logger;
        }

        /// <summary>
        /// Get recent activity logs (Admin only)
        /// </summary>
        [Authorize(Roles = "Admin")]
        [HttpGet("recent")]
        public async Task<IActionResult> GetRecentActivity([FromQuery] int count = 20)
        {
            try
            {
                var activities = await _activityLogService.GetRecentActivityAsync(count);
                return Ok(activities);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching recent activity");
                return StatusCode(500, new { message = "Error fetching activity logs" });
            }
        }

        /// <summary>
        /// Log a new activity (Internal use or Admin)
        /// </summary>
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> LogActivity([FromBody] CreateActivityLogDto dto)
        {
            try
            {
                var activity = await _activityLogService.LogActivityAsync(dto);
                return CreatedAtAction(nameof(GetRecentActivity), new { id = activity.Id }, activity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error logging activity");
                return StatusCode(500, new { message = "Error logging activity" });
            }
        }
    }
}
