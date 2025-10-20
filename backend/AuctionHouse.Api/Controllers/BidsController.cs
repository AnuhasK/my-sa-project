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

                // broadcast to group
                await _hub.Clients.Group(dto.AuctionId.ToString()).SendAsync("BidPlaced", new
                {
                    bid.Id, bid.AuctionId, bid.BidderId, bid.Amount, bid.Timestamp
                });

                return Ok(bid);
            }
            catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
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
