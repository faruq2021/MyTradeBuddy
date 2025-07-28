using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using MyTradeBuddy.Core.Entities;
using MyTradeBuddy.Core.Interfaces;

namespace MyTradeBuddy.Web.Controllers.Api
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsApiController : ControllerBase
    {
        private readonly IProductService _productService;
        private readonly UserManager<User> _userManager;

        public ProductsApiController(IProductService productService, UserManager<User> userManager)
        {
            _productService = productService;
            _userManager = userManager;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Product>>> GetProducts()
        {
            var userId = _userManager.GetUserId(User)!;
            var products = await _productService.GetAllProductsAsync(userId);
            return Ok(products);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Product>> GetProduct(int id)
        {
            var userId = _userManager.GetUserId(User)!;
            var product = await _productService.GetProductByIdAsync(id, userId);
            
            if (product == null)
                return NotFound();
                
            return Ok(product);
        }

        [HttpPost]
        public async Task<ActionResult<Product>> CreateProduct(Product product)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            product.UserId = _userManager.GetUserId(User)!;
            var createdProduct = await _productService.CreateProductAsync(product);
            return CreatedAtAction(nameof(GetProduct), new { id = createdProduct.Id }, createdProduct);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduct(int id, Product product)
        {
            if (id != product.Id)
                return BadRequest();

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            product.UserId = _userManager.GetUserId(User)!;
            await _productService.UpdateProductAsync(product);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var userId = _userManager.GetUserId(User)!;
            var result = await _productService.DeleteProductAsync(id, userId);
            
            if (!result)
                return NotFound();
                
            return NoContent();
        }

        [HttpGet("low-stock")]
        public async Task<ActionResult<IEnumerable<Product>>> GetLowStockProducts()
        {
            var userId = _userManager.GetUserId(User)!;
            var products = await _productService.GetLowStockProductsAsync(userId);
            return Ok(products);
        }
    }
}