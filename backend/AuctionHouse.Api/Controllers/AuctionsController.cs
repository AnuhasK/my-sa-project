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
        public async Task<IActionResult> GetAll() => Ok(await _svc.GetAllAsync());

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id) => Ok(await _svc.GetByIdAsync(id));

        [Authorize(Roles = "Seller,Admin")]
        [HttpPost]
        public async Task<IActionResult> Create(AuctionCreateDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
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
    }
}
