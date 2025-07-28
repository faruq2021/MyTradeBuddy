using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using MyTradeBuddy.Core.Entities;

namespace MyTradeBuddy.Infrastructure.Data
{
    public class ApplicationDbContext : IdentityDbContext<User>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }
        
        public DbSet<Product> Products { get; set; }
        public DbSet<Sale> Sales { get; set; }
        public DbSet<SaleItem> SaleItems { get; set; }
        public DbSet<Expense> Expenses { get; set; }
        
        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
            
            // Configure decimal precision
            builder.Entity<Product>()
                .Property(p => p.CostPrice)
                .HasPrecision(18, 2);
                
            builder.Entity<Product>()
                .Property(p => p.SellingPrice)
                .HasPrecision(18, 2);
                
            builder.Entity<Sale>()
                .Property(s => s.TotalAmount)
                .HasPrecision(18, 2);
                
            builder.Entity<Sale>()
                .Property(s => s.AmountPaid)
                .HasPrecision(18, 2);
                
            builder.Entity<Sale>()
                .Property(s => s.Balance)
                .HasPrecision(18, 2);
                
            builder.Entity<SaleItem>()
                .Property(si => si.UnitPrice)
                .HasPrecision(18, 2);
                
            builder.Entity<SaleItem>()
                .Property(si => si.TotalPrice)
                .HasPrecision(18, 2);
                
            builder.Entity<Expense>()
                .Property(e => e.Amount)
                .HasPrecision(18, 2);
                
            // Configure relationships
            builder.Entity<SaleItem>()
                .HasOne(si => si.Sale)
                .WithMany(s => s.SaleItems)
                .HasForeignKey(si => si.SaleId)
                .OnDelete(DeleteBehavior.Cascade);
                
            builder.Entity<SaleItem>()
                .HasOne(si => si.Product)
                .WithMany(p => p.SaleItems)
                .HasForeignKey(si => si.ProductId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}