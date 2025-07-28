namespace MyTradeBuddy.Core.Entities
{
    public class Sale
    {
        public int Id { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerPhone { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public decimal AmountPaid { get; set; }
        public decimal Balance { get; set; }
        public string PaymentMethod { get; set; } = string.Empty; // Cash, Transfer, POS
        public string PaymentStatus { get; set; } = string.Empty; // Paid, Partial, Pending
        public DateTime SaleDate { get; set; } = DateTime.UtcNow;
        public string Notes { get; set; } = string.Empty;
        
        // Foreign key
        public string UserId { get; set; } = string.Empty;
        public User User { get; set; } = null!;
        
        // Navigation properties
        public ICollection<SaleItem> SaleItems { get; set; } = new List<SaleItem>();
    }
}