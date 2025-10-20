using System.ComponentModel.DataAnnotations;

namespace AuctionHouse.Api.Models
{
    public class Category
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = null!;
        
        [StringLength(500)]
        public string? Description { get; set; }
        
        // Navigation property
        public ICollection<Auction> Auctions { get; set; } = new List<Auction>();
    }
}