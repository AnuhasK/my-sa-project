namespace AuctionHouse.Api.Services
{
    public interface IImageService
    {
        Task<string> SaveImageAsync(IFormFile file);
        Task<byte[]?> GetImageAsync(string fileName);
        Task DeleteImageAsync(string fileName);
    }

    public class ImageService : IImageService
    {
        private readonly string _uploadPath;
        private readonly IWebHostEnvironment _environment;
        private readonly ILogger<ImageService> _logger;

        public ImageService(IWebHostEnvironment environment, ILogger<ImageService> logger)
        {
            _environment = environment;
            _logger = logger;
            _uploadPath = Path.Combine(_environment.WebRootPath ?? _environment.ContentRootPath, "uploads", "images");
            
            // Ensure upload directory exists
            if (!Directory.Exists(_uploadPath))
            {
                Directory.CreateDirectory(_uploadPath);
            }
        }

        public async Task<string> SaveImageAsync(IFormFile file)
        {
            try
            {
                // Generate unique filename
                var fileExtension = Path.GetExtension(file.FileName);
                var fileName = $"{Guid.NewGuid()}{fileExtension}";
                var filePath = Path.Combine(_uploadPath, fileName);

                // Save the file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Return the relative URL that can be accessed via the API
                return $"/api/images/{fileName}";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving image file");
                throw;
            }
        }

        public async Task<byte[]?> GetImageAsync(string fileName)
        {
            try
            {
                var filePath = Path.Combine(_uploadPath, fileName);
                
                if (!File.Exists(filePath))
                {
                    return null;
                }

                return await File.ReadAllBytesAsync(filePath);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error reading image file: {FileName}", fileName);
                return null;
            }
        }

        public async Task DeleteImageAsync(string fileName)
        {
            try
            {
                var filePath = Path.Combine(_uploadPath, fileName);
                
                if (File.Exists(filePath))
                {
                    await Task.Run(() => File.Delete(filePath));
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting image file: {FileName}", fileName);
                throw;
            }
        }
    }
}