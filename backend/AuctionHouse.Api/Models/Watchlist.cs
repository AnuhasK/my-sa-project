using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AuctionHouse.Api.Models
{
    public class Watchlist
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        public int AuctionId { get; set; }

        [Required]
        public DateTime AddedDate { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey(nameof(UserId))]
        public User? User { get; set; }

        [ForeignKey(nameof(AuctionId))]
        public Auction? Auction { get; set; }
    }
}
