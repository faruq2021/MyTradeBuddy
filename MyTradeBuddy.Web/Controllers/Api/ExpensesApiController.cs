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

            var expense = await _expenseService.GetExpenseByIdAsync(id);
            if (expense == null || expense.UserId != user.Id)
                return NotFound();

            return Ok(expense);
        }

        [HttpPost]
        public async Task<ActionResult<Expense>> CreateExpense(Expense expense)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            expense.UserId = user.Id;
            expense.ExpenseDate = expense.ExpenseDate == default ? DateTime.Now : expense.ExpenseDate;

            var createdExpense = await _expenseService.CreateExpenseAsync(expense);
            return CreatedAtAction(nameof(GetExpense), new { id = createdExpense.Id }, createdExpense);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateExpense(int id, Expense expense)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            var existingExpense = await _expenseService.GetExpenseByIdAsync(id);
            if (existingExpense == null || existingExpense.UserId != user.Id)
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

            var expense = await _expenseService.GetExpenseByIdAsync(id);
            if (expense == null || expense.UserId != user.Id)
                return NotFound();

            await _expenseService.DeleteExpenseAsync(id);
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