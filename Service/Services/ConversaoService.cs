using Domain.Interfaces;
using Domain.Models;
using System.Text;

/* Minha abordagem para resolver o problema foi:

    - **Validação do JSON**: Primeiro, verifiquei se o JSON era um objeto único ou uma lista de objetos.
      - Se fosse uma lista, precisei processar cada objeto separadamente.
      - Se fosse um único objeto, podia processá-lo diretamente.

    - **Extração dos dados**: Para criar o CSV, peguei todas as chaves dos objetos e usei como cabeçalhos das colunas.
      - Percorri todos os objetos para garantir que todas as chaves fossem incluídas.

    - **Formatação do CSV**: O CSV foi montado com os cabeçalhos primeiro e depois os dados.
      - Cada linha do CSV representa um objeto JSON.
      - Se um objeto não tinha uma chave específica, deixei o valor em branco.

    - **Organização do código**: Separei a lógica em métodos menores para deixar o código mais organizado.
      - `AnalisarArrayJson`: Divide a lista de objetos JSON.
      - `ProcessarObjetoJson`: Transforma um objeto JSON em pares de chave-valor.
      - `DividirParesChaveValor`: Separa os pares chave-valor de um objeto JSON.
      - `RemoverAspasEnvolventes`: Remove aspas desnecessárias.

*/

namespace Service.Services
{
    public class ConversaoService : IConversaoService
    {
        public ConversaoResultado ConverterJsonParaCsv(string jsonEntrada)
        {
            var resultadoConversao = new ConversaoResultado();

            try
            {
                jsonEntrada = jsonEntrada.Trim();

                bool ehArray = false;
                if (jsonEntrada.StartsWith("[") && jsonEntrada.EndsWith("]"))
                {
                    ehArray = true;
                    jsonEntrada = jsonEntrada.Substring(1, jsonEntrada.Length - 2).Trim();
                }
                else if (jsonEntrada.StartsWith("{") && jsonEntrada.EndsWith("}"))
                {
                }
                else
                {
                    throw new Exception("Formato JSON inválido.");
                }

                var listaDeObjetos = new List<Dictionary<string, string>>();

                if (ehArray)
                {
                    var objetosJson = AnalisarArrayJson(jsonEntrada);

                    foreach (var objetoJson in objetosJson)
                    {
                        var dicionarioObjeto = ProcessarObjetoJson(objetoJson);
                        listaDeObjetos.Add(dicionarioObjeto);
                    }
                }
                else
                {
                    var dicionarioObjeto = ProcessarObjetoJson(jsonEntrada);
                    listaDeObjetos.Add(dicionarioObjeto);
                }

                var conjuntoCabecalhos = new HashSet<string>();
                foreach (var objeto in listaDeObjetos)
                {
                    foreach (var chave in objeto.Keys)
                    {
                        conjuntoCabecalhos.Add(chave);
                    }
                }

                var construtorCsv = new StringBuilder();

                construtorCsv.AppendLine(string.Join(",", conjuntoCabecalhos));

                foreach (var objeto in listaDeObjetos)
                {
                    var listaValores = new List<string>();
                    foreach (var cabecalho in conjuntoCabecalhos)
                    {
                        objeto.TryGetValue(cabecalho, out string valor);
                        listaValores.Add(valor ?? "");
                    }
                    construtorCsv.AppendLine(string.Join(",", listaValores));
                }

                resultadoConversao.Resultado = construtorCsv.ToString().Trim();
                resultadoConversao.Sucesso = true;
            }
            catch (Exception ex)
            {
                resultadoConversao.Sucesso = false;
                resultadoConversao.MensagemErro = ex.Message;
            }

            return resultadoConversao;
        }

        private List<string> AnalisarArrayJson(string jsonString)
        {
            var objetos = new List<string>();
            var objetoAtual = new StringBuilder();
            int chavesAbertas = 0;
            bool dentroDeString = false;
            char charAnterior = '\0';

            for (int i = 0; i < jsonString.Length; i++)
            {
                char charAtual = jsonString[i];

                if (charAtual == '"' && charAnterior != '\\')
                {
                    dentroDeString = !dentroDeString;
                }

                if (dentroDeString)
                {
                    objetoAtual.Append(charAtual);
                }
                else
                {
                    if (charAtual == '{')
                    {
                        if (chavesAbertas == 0)
                        {
                            objetoAtual.Clear();
                        }
                        chavesAbertas++;
                        objetoAtual.Append(charAtual);
                    }
                    else if (charAtual == '}')
                    {
                        objetoAtual.Append(charAtual);
                        chavesAbertas--;
                        if (chavesAbertas == 0)
                        {
                            objetos.Add(objetoAtual.ToString().Trim());
                            objetoAtual.Clear();
                        }
                    }
                    else if (chavesAbertas > 0)
                    {
                        objetoAtual.Append(charAtual);
                    }
                }

                charAnterior = charAtual;
            }

            return objetos;
        }

        private Dictionary<string, string> ProcessarObjetoJson(string objetoJson)
        {
            var dicionarioResultado = new Dictionary<string, string>();

            objetoJson = objetoJson.Trim();
            if (objetoJson.StartsWith("{") && objetoJson.EndsWith("}"))
            {
                objetoJson = objetoJson.Substring(1, objetoJson.Length - 2).Trim();
            }

            var listaDePares = DividirParesChaveValor(objetoJson);

            foreach (var par in listaDePares)
            {
                int indiceDoisPontos = par.IndexOf(':');

                if (indiceDoisPontos == -1)
                {
                    throw new Exception("Par chave-valor inválido: " + par);
                }

                var chave = par.Substring(0, indiceDoisPontos).Trim();
                var valor = par.Substring(indiceDoisPontos + 1).Trim();

                chave = RemoverAspasEnvolventes(chave);
                valor = RemoverAspasEnvolventes(valor);

                if (valor.StartsWith("{") || valor.StartsWith("["))
                {
                    valor = "";
                }

                dicionarioResultado[chave] = valor;
            }

            return dicionarioResultado;
        }

        private List<string> DividirParesChaveValor(string jsonContent)
        {
            var pares = new List<string>();
            var parAtual = new StringBuilder();
            bool dentroDeString = false;
            int chavesAbertas = 0;
            int colchetesAbertos = 0;
            char charAnterior = '\0';

            for (int i = 0; i < jsonContent.Length; i++)
            {
                char charAtual = jsonContent[i];

                if (charAtual == '"' && charAnterior != '\\')
                {
                    dentroDeString = !dentroDeString;
                }

                if (!dentroDeString)
                {
                    if (charAtual == '{')
                    {
                        chavesAbertas++;
                    }
                    else if (charAtual == '}')
                    {
                        chavesAbertas--;
                    }
                    else if (charAtual == '[')
                    {
                        colchetesAbertos++;
                    }
                    else if (charAtual == ']')
                    {
                        colchetesAbertos--;
                    }
                    else if (charAtual == ',' && chavesAbertas == 0 && colchetesAbertos == 0)
                    {
                        pares.Add(parAtual.ToString().Trim());
                        parAtual.Clear();
                        charAnterior = charAtual;
                        continue;
                    }
                }

                parAtual.Append(charAtual);
                charAnterior = charAtual;
            }

            if (parAtual.Length > 0)
            {
                pares.Add(parAtual.ToString().Trim());
            }

            return pares;
        }

        private string RemoverAspasEnvolventes(string texto)
        {
            if (texto.StartsWith("\"") && texto.EndsWith("\""))
            {
                texto = texto.Substring(1, texto.Length - 2);
            }
            return texto;
        }
    }
}
