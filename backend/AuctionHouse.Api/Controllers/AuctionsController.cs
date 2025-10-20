using AuctionHouse.Api.DTOs;
using AuctionHouse.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AuctionHouse.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuctionsController : ControllerBase
    {
        private readonly IAuctionService _svc;
        public AuctionsController(IAuctionService svc) { _svc = svc; }

        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] string? search,
            [FromQuery] int? categoryId,
            [FromQuery] string? status,
            [FromQuery] decimal? minPrice,
            [FromQuery] decimal? maxPrice,
            [FromQuery] string? sortBy)
        {
            var auctions = await _svc.GetAllAsync(search, categoryId, status, minPrice, maxPrice, sortBy);
            return Ok(auctions);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id) => Ok(await _svc.GetByIdAsync(id));

        [Authorize(Roles = "Admin")] // Only admins can create auctions
        [HttpPost]
        public async Task<IActionResult> Create(AuctionCreateDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized(new { message = "Invalid authentication token" });
            }
            
            var auction = await _svc.CreateAsync(userId, dto);
            return CreatedAtAction(nameof(Get), new { id = auction.Id }, auction);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("{id}/close")]
        public async Task<IActionResult> Close(int id)
        {
            await _svc.CloseAuctionAsync(id);
            return NoContent();
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, AuctionUpdateDto dto)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
                {
                    return Unauthorized(new { message = "Invalid authentication token" });
                }

                var isAdmin = User.IsInRole("Admin");
                var updatedAuction = await _svc.UpdateAsync(id, dto, userId, isAdmin);

                if (updatedAuction == null)
                    return NotFound(new { message = "Auction not found" });

                return Ok(updatedAuction);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (ApplicationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
                {
                    return Unauthorized(new { message = "Invalid authentication token" });
                }

                var isAdmin = User.IsInRole("Admin");
                var result = await _svc.DeleteAsync(id, userId, isAdmin);

                return NoContent();
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (ApplicationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize]
        [HttpGet("my-auctions")]
        public async Task<IActionResult> GetMyAuctions()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized(new { message = "Invalid authentication token" });
            }

            var auctions = await _svc.GetUserAuctionsAsync(userId);
            return Ok(auctions);
        }
    }
}
