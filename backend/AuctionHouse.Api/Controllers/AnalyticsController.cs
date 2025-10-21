using AuctionHouse.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuctionHouse.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AnalyticsController : ControllerBase
    {
        private readonly IAnalyticsService _analyticsService;
        private readonly ILogger<AnalyticsController> _logger;

        public AnalyticsController(
            IAnalyticsService analyticsService,
            ILogger<AnalyticsController> logger)
        {
            _analyticsService = analyticsService;
            _logger = logger;
        }

        [HttpGet("revenue")]
        public async Task<IActionResult> GetRevenueData([FromQuery] int months = 9)
        {
            try
            {
                var data = await _analyticsService.GetRevenueDataAsync(months);
                return Ok(data);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving revenue data");
                return StatusCode(500, "An error occurred while retrieving revenue data");
            }
        }

        [HttpGet("user-growth")]
        public async Task<IActionResult> GetUserGrowth([FromQuery] int months = 9)
        {
            try
            {
                var data = await _analyticsService.GetUserGrowthDataAsync(months);
                return Ok(data);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user growth data");
                return StatusCode(500, "An error occurred while retrieving user growth data");
            }
        }

        [HttpGet("categories")]
        public async Task<IActionResult> GetCategoryDistribution()
        {
            try
            {
                var data = await _analyticsService.GetCategoryDistributionAsync();
                return Ok(data);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving category distribution");
                return StatusCode(500, "An error occurred while retrieving category distribution");
            }
        }

        [HttpGet("top-auctions")]
        public async Task<IActionResult> GetTopPerformingAuctions([FromQuery] int count = 5)
        {
            try
            {
                var data = await _analyticsService.GetTopPerformingAuctionsAsync(count);
                return Ok(data);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving top performing auctions");
                return StatusCode(500, "An error occurred while retrieving top performing auctions");
            }
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetAnalyticsStats()
        {
            try
            {
                var data = await _analyticsService.GetAnalyticsStatsAsync();
                return Ok(data);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving analytics stats");
                return StatusCode(500, "An error occurred while retrieving analytics stats");
            }
        }
    }
}
