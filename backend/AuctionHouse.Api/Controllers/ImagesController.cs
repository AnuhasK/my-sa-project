using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AuctionHouse.Api.Services;

namespace AuctionHouse.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ImagesController : ControllerBase
    {
        private readonly IImageService _imageService;
        private readonly ILogger<ImagesController> _logger;

        public ImagesController(IImageService imageService, ILogger<ImagesController> logger)
        {
            _imageService = imageService;
            _logger = logger;
        }

        [HttpPost("upload")]
        [Authorize] // Only authenticated users can upload images
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest("No file provided");
                }

                // Validate file type
                var allowedTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp" };
                if (!allowedTypes.Contains(file.ContentType.ToLower()))
                {
                    return BadRequest("Only image files (JPEG, PNG, GIF, WebP) are allowed");
                }

                // Validate file size (max 5MB)
                if (file.Length > 5 * 1024 * 1024)
                {
                    return BadRequest("File size cannot exceed 5MB");
                }

                var imageUrl = await _imageService.SaveImageAsync(file);
                
                return Ok(new { imageUrl = imageUrl });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading image");
                return StatusCode(500, "Error uploading image");
            }
        }

        [HttpDelete("{fileName}")]
        [Authorize]
        public async Task<IActionResult> DeleteImage(string fileName)
        {
            try
            {
                await _imageService.DeleteImageAsync(fileName);
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting image: {FileName}", fileName);
                return StatusCode(500, "Error deleting image");
            }
        }

        [HttpGet("{fileName}")]
        public async Task<IActionResult> GetImage(string fileName)
        {
            try
            {
                var imageBytes = await _imageService.GetImageAsync(fileName);
                if (imageBytes == null)
                {
                    return NotFound();
                }

                var contentType = GetContentType(fileName);
                return File(imageBytes, contentType);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving image: {FileName}", fileName);
                return NotFound();
            }
        }

        private string GetContentType(string fileName)
        {
            var extension = Path.GetExtension(fileName).ToLowerInvariant();
            return extension switch
            {
                ".jpg" or ".jpeg" => "image/jpeg",
                ".png" => "image/png",
                ".gif" => "image/gif",
                ".webp" => "image/webp",
                _ => "application/octet-stream"
            };
        }
    }
}