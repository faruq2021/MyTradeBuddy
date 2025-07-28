using MyTradeBuddy.Core.Entities;

namespace MyTradeBuddy.Core.Interfaces
{
    public interface ISaleService
    {
        Task<IEnumerable<Sale>> GetAllSalesAsync(string userId);
        Task<Sale?> GetSaleByIdAsync(int id, string userId);
        Task<Sale> CreateSaleAsync(Sale sale);
        Task<Sale> UpdateSaleAsync(Sale sale);
        Task<bool> DeleteSaleAsync(int id, string userId);
        Task<decimal> GetTotalSalesAsync(string userId, DateTime? startDate = null, DateTime? endDate = null);
        Task<IEnumerable<Sale>> GetSalesByDateRangeAsync(string userId, DateTime startDate, DateTime endDate);
    }
}