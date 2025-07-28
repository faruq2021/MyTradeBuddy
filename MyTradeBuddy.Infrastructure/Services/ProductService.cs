using Microsoft.EntityFrameworkCore;
using MyTradeBuddy.Core.Entities;
using MyTradeBuddy.Core.Interfaces;
using MyTradeBuddy.Infrastructure.Data;

namespace MyTradeBuddy.Infrastructure.Services
{
    public class ProductService : IProductService
    {
        private readonly ApplicationDbContext _context;

        public ProductService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Product>> GetAllProductsAsync(string userId)
        {
            return await _context.Products
                .Where(p => p.UserId == userId && p.IsActive)
                .OrderBy(p => p.Name)
                .ToListAsync();
        }

        public async Task<Product?> GetProductByIdAsync(int id, string userId)
        {
            return await _context.Products
                .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);
        }

        public async Task<Product> CreateProductAsync(Product product)
        {
            _context.Products.Add(product);
            await _context.SaveChangesAsync();
            return product;
        }

        public async Task<Product> UpdateProductAsync(Product product)
        {
            product.UpdatedAt = DateTime.UtcNow;
            _context.Products.Update(product);
            await _context.SaveChangesAsync();
            return product;
        }

        public async Task<bool> DeleteProductAsync(int id, string userId)
        {
            var product = await GetProductByIdAsync(id, userId);
            if (product == null) return false;

            product.IsActive = false;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<Product>> GetLowStockProductsAsync(string userId)
        {
            return await _context.Products
                .Where(p => p.UserId == userId && p.IsActive && p.StockQuantity <= p.MinimumStockLevel)
                .ToListAsync();
        }

        public async Task<bool> UpdateStockAsync(int productId, int quantity, string userId)
        {
            var product = await GetProductByIdAsync(productId, userId);
            if (product == null) return false;

            product.StockQuantity = quantity;
            product.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }
    }
}