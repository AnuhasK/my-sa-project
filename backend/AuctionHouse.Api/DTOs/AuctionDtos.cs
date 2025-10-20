using System.ComponentModel.DataAnnotations;

namespace AuctionHouse.Api.DTOs
{
    public class AuctionCreateDto 
    { 
        [Required]
        [StringLength(100, MinimumLength = 5, ErrorMessage = "Title must be between 5 and 100 characters")]
        public string Title { get; set; } = null!; 

        [Required]
        [StringLength(1000, MinimumLength = 20, ErrorMessage = "Description must be between 20 and 1000 characters")]
        public string Description { get; set; } = null!; 

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Start price must be greater than 0")]
        public decimal StartPrice { get; set; } 

        [Required]
        public DateTime StartTime { get; set; } 

        [Required]
        public DateTime EndTime { get; set; } 

        public int CategoryId { get; set; }
    }

    public class AuctionUpdateDto
    {
        [Required]
        [StringLength(100, MinimumLength = 5, ErrorMessage = "Title must be between 5 and 100 characters")]
        public string Title { get; set; } = null!;

        [Required]
        [StringLength(1000, MinimumLength = 20, ErrorMessage = "Description must be between 20 and 1000 characters")]
        public string Description { get; set; } = null!;

        [Required]
        public DateTime EndTime { get; set; }

        public int CategoryId { get; set; }
    }

    public class AuctionResponseDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = null!;
        public string Description { get; set; } = null!;
        public decimal StartPrice { get; set; }
        public decimal CurrentPrice { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public int SellerId { get; set; }
        public string Status { get; set; } = null!;
        public string CategoryName { get; set; } = null!;
        public int CategoryId { get; set; }
        public List<string> ImageUrls { get; set; } = new();
        public int BidCount { get; set; }
    }

    public class AuctionListDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = null!;
        public string Description { get; set; } = null!;
        public decimal CurrentPrice { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string Status { get; set; } = null!;
        public string CategoryName { get; set; } = null!;
        public int CategoryId { get; set; }
        public string? PrimaryImageUrl { get; set; }
        public int BidCount { get; set; }
    }

    public class ImageReorderDto
    {
        public int ImageId { get; set; }
        public int DisplayOrder { get; set; }
    }

    public class ImageUrlDto
    {
        [Required]
        public string Url { get; set; } = null!;
    }
}
