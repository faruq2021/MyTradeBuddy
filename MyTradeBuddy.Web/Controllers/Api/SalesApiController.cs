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
    public class SalesApiController : ControllerBase
    {
        private readonly ISaleService _saleService;
        private readonly UserManager<User> _userManager;

        public SalesApiController(ISaleService saleService, UserManager<User> userManager)
        {
            _saleService = saleService;
            _userManager = userManager;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Sale>>> GetSales()
        {
            var userId = _userManager.GetUserId(User)!;
            var sales = await _saleService.GetAllSalesAsync(userId);
            return Ok(sales);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Sale>> GetSale(int id)
        {
            var userId = _userManager.GetUserId(User)!;
            var sale = await _saleService.GetSaleByIdAsync(id, userId);
            
            if (sale == null)
                return NotFound();
                
            return Ok(sale);
        }

        [HttpPost]
        public async Task<ActionResult<Sale>> CreateSale(Sale sale)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            sale.UserId = _userManager.GetUserId(User)!;
            var createdSale = await _saleService.CreateSaleAsync(sale);
            return CreatedAtAction(nameof(GetSale), new { id = createdSale.Id }, createdSale);
        }

        [HttpGet("total")]
        public async Task<ActionResult<decimal>> GetTotalSales([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            var userId = _userManager.GetUserId(User)!;
            var total = await _saleService.GetTotalSalesAsync(userId, startDate, endDate);
            return Ok(total);
        }
    }
}