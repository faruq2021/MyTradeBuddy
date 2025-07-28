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
    public class ExpensesApiController : ControllerBase
    {
        private readonly IExpenseService _expenseService;
        private readonly UserManager<User> _userManager;

        public ExpensesApiController(IExpenseService expenseService, UserManager<User> userManager)
        {
            _expenseService = expenseService;
            _userManager = userManager;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Expense>>> GetExpenses()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            var expenses = await _expenseService.GetExpensesByUserIdAsync(user.Id);
            return Ok(expenses);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Expense>> GetExpense(int id)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            var expense = await _expenseService.GetExpenseByIdAsync(id, user.Id); // Add user.Id parameter
            if (expense == null)
                return NotFound();

            return Ok(expense);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateExpense(int id, Expense expense)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            var existingExpense = await _expenseService.GetExpenseByIdAsync(id, user.Id); // Add user.Id parameter
            if (existingExpense == null)
                return NotFound();

            expense.Id = id;
            expense.UserId = user.Id;
            await _expenseService.UpdateExpenseAsync(expense);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteExpense(int id)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            var expense = await _expenseService.GetExpenseByIdAsync(id, user.Id); // Add user.Id parameter
            if (expense == null)
                return NotFound();

            await _expenseService.DeleteExpenseAsync(id, user.Id); // Add user.Id parameter
            return NoContent();
        }

        [HttpGet("total")]
        public async Task<ActionResult<decimal>> GetTotalExpenses()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            var total = await _expenseService.GetTotalExpensesByUserIdAsync(user.Id);
            return Ok(total);
        }

        [HttpGet("by-category")]
        public async Task<ActionResult> GetExpensesByCategory()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            var expenses = await _expenseService.GetExpensesByUserIdAsync(user.Id);
            var expensesByCategory = expenses
                .GroupBy(e => e.Category)
                .Select(g => new { Category = g.Key, Total = g.Sum(e => e.Amount) })
                .ToList();

            return Ok(expensesByCategory);
        }
    }
}