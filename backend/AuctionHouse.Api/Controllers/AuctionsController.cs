using AuctionHouse.Api.DTOs;
using AuctionHouse.Api.Services;
using AuctionHouse.Api.Data;
using AuctionHouse.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace AuctionHouse.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuctionsController : ControllerBase
    {
        private readonly IAuctionService _svc;
        private readonly ApplicationDbContext _db;
        private readonly IImageService _imageSvc;

        public AuctionsController(IAuctionService svc, ApplicationDbContext db, IImageService imageSvc) 
        { 
            _svc = svc;
            _db = db;
            _imageSvc = imageSvc;
        }

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
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
                {
                    return Unauthorized(new { message = "Invalid authentication token" });
                }
                
                var auction = await _svc.CreateAsync(userId, dto);
                return CreatedAtAction(nameof(Get), new { id = auction.Id }, auction);
            }
            catch (ApplicationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
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

        // Image Management Endpoints
        
        [Authorize]
        [HttpPost("{id}/images/url")]
        public async Task<IActionResult> AddImageByUrl(int id, [FromBody] ImageUrlDto dto)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
                {
                    return Unauthorized(new { message = "Invalid authentication token" });
                }

                var auction = await _db.Auctions.Include(a => a.Images).FirstOrDefaultAsync(a => a.Id == id);
                if (auction == null)
                    return NotFound(new { message = "Auction not found" });

                // Check ownership or admin
                var isAdmin = User.IsInRole("Admin");
                if (auction.SellerId != userId && !isAdmin)
                    return Forbid();

                // Determine display order (next available)
                var maxOrder = auction.Images.Any() ? auction.Images.Max(i => i.DisplayOrder) : -1;

                // Add to auction
                var auctionImage = new AuctionImage
                {
                    AuctionId = id,
                    Url = dto.Url,
                    IsPrimary = !auction.Images.Any(), // First image is primary by default
                    DisplayOrder = maxOrder + 1
                };

                _db.AuctionImages.Add(auctionImage);
                await _db.SaveChangesAsync();

                return Ok(new { id = auctionImage.Id, url = auctionImage.Url, isPrimary = auctionImage.IsPrimary, displayOrder = auctionImage.DisplayOrder });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize]
        [HttpPost("{id}/images")]
        public async Task<IActionResult> AddImage(int id, IFormFile file)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
                {
                    return Unauthorized(new { message = "Invalid authentication token" });
                }

                var auction = await _db.Auctions.Include(a => a.Images).FirstOrDefaultAsync(a => a.Id == id);
                if (auction == null)
                    return NotFound(new { message = "Auction not found" });

                // Check ownership or admin
                var isAdmin = User.IsInRole("Admin");
                if (auction.SellerId != userId && !isAdmin)
                    return Forbid();

                // Upload image
                var imageUrl = await _imageSvc.SaveImageAsync(file);

                // Determine display order (next available)
                var maxOrder = auction.Images.Any() ? auction.Images.Max(i => i.DisplayOrder) : -1;

                // Add to auction
                var auctionImage = new AuctionImage
                {
                    AuctionId = id,
                    Url = imageUrl,
                    IsPrimary = !auction.Images.Any(), // First image is primary by default
                    DisplayOrder = maxOrder + 1
                };

                _db.AuctionImages.Add(auctionImage);
                await _db.SaveChangesAsync();

                return Ok(new { id = auctionImage.Id, url = auctionImage.Url, isPrimary = auctionImage.IsPrimary, displayOrder = auctionImage.DisplayOrder });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize]
        [HttpDelete("{auctionId}/images/{imageId}")]
        public async Task<IActionResult> DeleteImage(int auctionId, int imageId)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
                {
                    return Unauthorized(new { message = "Invalid authentication token" });
                }

                var auction = await _db.Auctions.Include(a => a.Images).FirstOrDefaultAsync(a => a.Id == auctionId);
                if (auction == null)
                    return NotFound(new { message = "Auction not found" });

                // Check ownership or admin
                var isAdmin = User.IsInRole("Admin");
                if (auction.SellerId != userId && !isAdmin)
                    return Forbid();

                var image = auction.Images.FirstOrDefault(i => i.Id == imageId);
                if (image == null)
                    return NotFound(new { message = "Image not found" });

                // Delete from storage
                var fileName = Path.GetFileName(image.Url);
                await _imageSvc.DeleteImageAsync(fileName);

                // Delete from database
                _db.AuctionImages.Remove(image);

                // If this was primary, make first remaining image primary
                if (image.IsPrimary && auction.Images.Count > 1)
                {
                    var newPrimary = auction.Images.Where(i => i.Id != imageId).OrderBy(i => i.DisplayOrder).First();
                    newPrimary.IsPrimary = true;
                }

                await _db.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize]
        [HttpPut("{auctionId}/images/{imageId}/primary")]
        public async Task<IActionResult> SetPrimaryImage(int auctionId, int imageId)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
                {
                    return Unauthorized(new { message = "Invalid authentication token" });
                }

                var auction = await _db.Auctions.Include(a => a.Images).FirstOrDefaultAsync(a => a.Id == auctionId);
                if (auction == null)
                    return NotFound(new { message = "Auction not found" });

                // Check ownership or admin
                var isAdmin = User.IsInRole("Admin");
                if (auction.SellerId != userId && !isAdmin)
                    return Forbid();

                var image = auction.Images.FirstOrDefault(i => i.Id == imageId);
                if (image == null)
                    return NotFound(new { message = "Image not found" });

                // Unset all primary flags
                foreach (var img in auction.Images)
                {
                    img.IsPrimary = false;
                }

                // Set this image as primary
                image.IsPrimary = true;

                await _db.SaveChangesAsync();

                return Ok(new { message = "Primary image updated" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize]
        [HttpPut("{id}/images/reorder")]
        public async Task<IActionResult> ReorderImages(int id, [FromBody] List<ImageReorderDto> reorderData)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
                {
                    return Unauthorized(new { message = "Invalid authentication token" });
                }

                var auction = await _db.Auctions.Include(a => a.Images).FirstOrDefaultAsync(a => a.Id == id);
                if (auction == null)
                    return NotFound(new { message = "Auction not found" });

                // Check ownership or admin
                var isAdmin = User.IsInRole("Admin");
                if (auction.SellerId != userId && !isAdmin)
                    return Forbid();

                // Update display orders
                foreach (var item in reorderData)
                {
                    var image = auction.Images.FirstOrDefault(i => i.Id == item.ImageId);
                    if (image != null)
                    {
                        image.DisplayOrder = item.DisplayOrder;
                    }
                }

                await _db.SaveChangesAsync();

                return Ok(new { message = "Images reordered successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
