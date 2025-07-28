using MyTradeBuddy.Core.Entities;

namespace MyTradeBuddy.Core.Interfaces
{
    public interface IExpenseService
    {
        Task<IEnumerable<Expense>> GetAllExpensesAsync(string userId);
        Task<IEnumerable<Expense>> GetExpensesByUserIdAsync(string userId); // Add this method
        Task<Expense?> GetExpenseByIdAsync(int id, string userId);
        Task<Expense> CreateExpenseAsync(Expense expense);
        Task<Expense> UpdateExpenseAsync(Expense expense);
        Task<bool> DeleteExpenseAsync(int id, string userId);
        Task<decimal> GetTotalExpensesAsync(string userId, DateTime? startDate = null, DateTime? endDate = null);
        Task<decimal> GetTotalExpensesByUserIdAsync(string userId); // Add this method
        Task<IEnumerable<Expense>> GetExpensesByDateRangeAsync(string userId, DateTime startDate, DateTime endDate);
    }
}