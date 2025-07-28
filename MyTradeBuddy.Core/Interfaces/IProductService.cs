using MyTradeBuddy.Core.Entities;

namespace MyTradeBuddy.Core.Interfaces
{
    public interface IProductService
    {
        Task<IEnumerable<Product>> GetAllProductsAsync(string userId);
        Task<Product?> GetProductByIdAsync(int id, string userId);
        Task<Product> CreateProductAsync(Product product);
        Task<Product> UpdateProductAsync(Product product);
        Task<bool> DeleteProductAsync(int id, string userId);
        Task<IEnumerable<Product>> GetLowStockProductsAsync(string userId);
        Task<bool> UpdateStockAsync(int productId, int quantity, string userId);
    }
}