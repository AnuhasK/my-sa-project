using AuctionHouse.Api.DTOs;
using AuctionHouse.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using AuctionHouse.Api.Hubs;
using System.Security.Claims;

namespace AuctionHouse.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BidsController : ControllerBase
    {
        private readonly IBidService _bidSvc;
        private readonly IHubContext<AuctionHub> _hub;

        public BidsController(IBidService bidSvc, IHubContext<AuctionHub> hub) { _bidSvc = bidSvc; _hub = hub; }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> PlaceBid(BidCreateDto dto)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
                {
                    return Unauthorized(new { message = "Invalid authentication token" });
                }
                
                var bid = await _bidSvc.PlaceBidAsync(userId, dto.AuctionId, dto.Amount);

                // broadcast to group (wrapped in try-catch to prevent 500 errors if SignalR fails)
                try
                {
                    await _hub.Clients.Group(dto.AuctionId.ToString()).SendAsync("BidPlaced", new
                    {
                        bid.Id, bid.AuctionId, bid.BidderId, bid.Amount, bid.Timestamp
                    });
                }
                catch
                {
                    // SignalR broadcast failed, but bid was successful - continue
                }

                // Return a simple response without circular references
                var response = new
                {
                    bid.Id,
                    bid.AuctionId,
                    bid.BidderId,
                    bid.Amount,
                    bid.Timestamp
                };

                return Ok(response);
            }
            catch (ApplicationException ex) 
            { 
                return BadRequest(new { message = ex.Message }); 
            }
            catch (Exception ex) 
            { 
                // Log unexpected errors
                Console.WriteLine($"Bid error: {ex.GetType().Name}: {ex.Message}");
                Console.WriteLine($"Stack: {ex.StackTrace}");
                return StatusCode(500, new { message = "An error occurred while placing the bid", details = ex.Message }); 
            }
        }

        [HttpGet("auction/{auctionId}")]
        public async Task<IActionResult> GetBidsForAuction(int auctionId)
        {
            try
            {
                var bids = await _bidSvc.GetBidsForAuctionAsync(auctionId);
                return Ok(bids);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize]
        [HttpGet("my-bids")]
        public async Task<IActionResult> GetMyBids()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
                {
                    return Unauthorized(new { message = "Invalid authentication token" });
                }

                var bids = await _bidSvc.GetUserBidsAsync(userId);
                return Ok(bids);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
