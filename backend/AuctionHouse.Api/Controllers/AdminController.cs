using AuctionHouse.Api.DTOs;
using AuctionHouse.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuctionHouse.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;
        private readonly ILogger<AdminController> _logger;

        public AdminController(IAdminService adminService, ILogger<AdminController> logger)
        {
            _adminService = adminService;
            _logger = logger;
        }

        /// <summary>
        /// Get dashboard statistics
        /// </summary>
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            try
            {
                var stats = await _adminService.GetDashboardStatsAsync();
                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting dashboard stats");
                return StatusCode(500, new { message = "Error retrieving dashboard statistics" });
            }
        }

        /// <summary>
        /// Get all users (paginated with search)
        /// </summary>
        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 50,
            [FromQuery] string? searchTerm = null)
        {
            try
            {
                var users = await _adminService.GetAllUsersAsync(pageNumber, pageSize, searchTerm);
                return Ok(users);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting users");
                return StatusCode(500, new { message = "Error retrieving users" });
            }
        }

        /// <summary>
        /// Get detailed information about a specific user
        /// </summary>
        [HttpGet("users/{id}")]
        public async Task<IActionResult> GetUserDetails(int id)
        {
            try
            {
                var user = await _adminService.GetUserDetailsAsync(id);
                
                if (user == null)
                {
                    return NotFound(new { message = "User not found" });
                }

                return Ok(user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting user {id} details");
                return StatusCode(500, new { message = "Error retrieving user details" });
            }
        }

        /// <summary>
        /// Suspend a user
        /// </summary>
        [HttpPut("users/{id}/suspend")]
        public async Task<IActionResult> SuspendUser(int id, [FromBody] UserActionDto dto)
        {
            try
            {
                var success = await _adminService.SuspendUserAsync(id, dto.Reason ?? "No reason provided");
                
                if (!success)
                {
                    return NotFound(new { message = "User not found" });
                }

                return Ok(new { message = "User suspended successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error suspending user {id}");
                return StatusCode(500, new { message = "Error suspending user" });
            }
        }

        /// <summary>
        /// Activate a suspended user
        /// </summary>
        [HttpPut("users/{id}/activate")]
        public async Task<IActionResult> ActivateUser(int id)
        {
            try
            {
                var success = await _adminService.ActivateUserAsync(id);
                
                if (!success)
                {
                    return NotFound(new { message = "User not found" });
                }

                return Ok(new { message = "User activated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error activating user {id}");
                return StatusCode(500, new { message = "Error activating user" });
            }
        }

        /// <summary>
        /// Delete a user (soft delete)
        /// </summary>
        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            try
            {
                var success = await _adminService.DeleteUserAsync(id);
                
                if (!success)
                {
                    return NotFound(new { message = "User not found" });
                }

                return Ok(new { message = "User deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting user {id}");
                return StatusCode(500, new { message = "Error deleting user" });
            }
        }

        /// <summary>
        /// Create a new user
        /// </summary>
        [HttpPost("users")]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserDto dto)
        {
            try
            {
                var userId = await _adminService.CreateUserAsync(dto);
                
                if (userId == 0)
                {
                    return BadRequest(new { message = "Failed to create user. Username or email may already exist." });
                }

                return Ok(new { message = "User created successfully", userId });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating user");
                return StatusCode(500, new { message = "Error creating user" });
            }
        }

        /// <summary>
        /// Update user role
        /// </summary>
        [HttpPut("users/{id}/role")]
        public async Task<IActionResult> UpdateUserRole(int id, [FromBody] UpdateRoleDto dto)
        {
            try
            {
                var success = await _adminService.UpdateUserRoleAsync(id, dto.Role);
                
                if (!success)
                {
                    return NotFound(new { message = "User not found" });
                }

                return Ok(new { message = "User role updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating role for user {id}");
                return StatusCode(500, new { message = "Error updating user role" });
            }
        }

        /// <summary>
        /// Get flagged auctions
        /// </summary>
        [HttpGet("auctions/flagged")]
        public async Task<IActionResult> GetFlaggedAuctions()
        {
            try
            {
                var auctions = await _adminService.GetFlaggedAuctionsAsync();
                return Ok(auctions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting flagged auctions");
                return StatusCode(500, new { message = "Error retrieving flagged auctions" });
            }
        }

        /// <summary>
        /// Remove an auction
        /// </summary>
        [HttpPut("auctions/{id}/remove")]
        public async Task<IActionResult> RemoveAuction(int id, [FromBody] UserActionDto dto)
        {
            try
            {
                var success = await _adminService.RemoveAuctionAsync(id, dto.Reason ?? "No reason provided");
                
                if (!success)
                {
                    return NotFound(new { message = "Auction not found" });
                }

                return Ok(new { message = "Auction removed successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error removing auction {id}");
                return StatusCode(500, new { message = "Error removing auction" });
            }
        }
    }
}
