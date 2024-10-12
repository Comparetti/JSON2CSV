using Domain.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Web.Controllers
{
    public class ConversaoController : Controller
    {
        private readonly IConversaoService _conversaoService;

        public ConversaoController(IConversaoService conversaoService)
        {
            _conversaoService = conversaoService;
        }

        public IActionResult JsonToCsv()
        {
            return View();
        }

        [HttpPost]
        public IActionResult JsonToCsv(string jsonData)
        {
            if (string.IsNullOrWhiteSpace(jsonData))
            {
                return BadRequest("JSON de entrada está vazio.");
            }

            var resultado = _conversaoService.ConverterJsonParaCsv(jsonData);

            if (resultado.Sucesso)
            {
                return Json(new { csvData = resultado.Resultado });
            }
            else
            {
                return BadRequest(resultado.MensagemErro);
            }
        }

    }
}
