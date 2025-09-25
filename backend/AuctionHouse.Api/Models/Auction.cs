using System.ComponentModel.DataAnnotations;

namespace AuctionHouse.Api.Models
{
    public class Auction
    {
        public int Id { get; set; }
        public string Title { get; set; } = null!;
        public string Description { get; set; } = null!;
        public decimal StartPrice { get; set; }
        public decimal CurrentPrice { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public int SellerId { get; set; }
        public User Seller { get; set; } = null!;
        public int? CategoryId { get; set; }
        public Category? Category { get; set; }
        public string Status { get; set; } = "Scheduled"; // Scheduled, Open, Closed
        public ICollection<Bid> Bids { get; set; } = new List<Bid>();
        public ICollection<AuctionImage> Images { get; set; } = new List<AuctionImage>();
        public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();

    }
}
