namespace AuctionHouse.Api.DTOs
{
    public class TransactionDto
    {
        public int Id { get; set; }
        public int AuctionId { get; set; }
        public string AuctionTitle { get; set; } = string.Empty;
        public int BuyerId { get; set; }
        public string BuyerUsername { get; set; } = string.Empty;
        public string BuyerEmail { get; set; } = string.Empty;
        public int SellerId { get; set; }
        public string SellerUsername { get; set; } = string.Empty;
        public string SellerEmail { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string PaymentStatus { get; set; } = "Pending";
        public DateTime CreatedAt { get; set; }
    }

    public class UpdatePaymentStatusDto
    {
        public string PaymentStatus { get; set; } = string.Empty; // "Pending", "Paid", "Failed", "Refunded"
    }

    public class TransactionListDto
    {
        public int Id { get; set; }
        public int AuctionId { get; set; }
        public string AuctionTitle { get; set; } = string.Empty;
        public string OtherPartyUsername { get; set; } = string.Empty; // Buyer for seller, Seller for buyer
        public decimal Amount { get; set; }
        public string PaymentStatus { get; set; } = "Pending";
        public DateTime CreatedAt { get; set; }
    }
}
