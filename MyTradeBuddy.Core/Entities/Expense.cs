namespace MyTradeBuddy.Core.Entities
{
    public class Expense
    {
        public int Id { get; set; }
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty; // Transport, Rent, Utilities, etc.
        public decimal Amount { get; set; }
        public DateTime ExpenseDate { get; set; } = DateTime.UtcNow;
        public string PaymentMethod { get; set; } = string.Empty;
        public string Receipt { get; set; } = string.Empty; // File path for receipt image
        public string Notes { get; set; } = string.Empty;
        
        // Foreign key
        public string UserId { get; set; } = string.Empty;
        public User User { get; set; } = null!;
    }
}