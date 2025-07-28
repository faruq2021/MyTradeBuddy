using Microsoft.AspNetCore.Mvc;

namespace MyTradeBuddy.Web.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}