# JSON2CSV Converter

## Descrição do Projeto

O **JSON2CSV Converter** é uma aplicação ASP.NET Core, desenvolvida com o objetivo de converter arquivos no formato JSON para CSV. A aplicação permite que o usuário cole ou carregue um JSON em uma caixa de texto, gere seu CSV equivalente e faça o download do resultado. 

A aplicação oferece duas abordagens: a conversão pode ser feita no **front-end** (via JavaScript) ou no **back-end** (via C#). Além disso, foi criada uma interface utilizando o **AdminLTE** como base de design, proporcionando uma experiência intuitiva e amigável para os usuários.

## Funcionalidades

- **Conversão de JSON para CSV (front-end e back-end)**
  - O usuário pode escolher realizar a conversão diretamente no navegador ou no servidor.
  - Exibição do CSV convertido em uma caixa de texto após a conversão.
  - Opção de copiar o JSON de exemplo para facilitar os testes.

- **Feedback Visual**
  - Modal visual de sucesso após a conversão.
  - Mensagens de erro detalhadas caso o JSON seja inválido.

- **Download do CSV**
  - O usuário pode baixar o CSV gerado após a conversão.

- **Exibição em Tabela**
  - Exibição do CSV gerado em uma tabela para melhor visualização.
  - Interação com o resultado, permitindo copiar ou baixar o CSV gerado.

## Tecnologias Utilizadas

- **ASP.NET Core 8.0**
- **JavaScript/JQuery**
- **AdminLTE Template**
- **HTML/CSS**
- **Bootstrap**

## Estrutura do Projeto

- **Controllers**: Controladores responsáveis pelo roteamento e chamadas de conversão (front e back-end).
  - `ConversaoController`: Gerencia as requisições relacionadas à conversão de JSON para CSV.
  
- **Services**: Lógica de negócios para a conversão de JSON para CSV.
  - `ConversaoService`: Implementação do serviço de conversão de JSON para CSV no back-end, sem bibliotecas externas.

- **Views**: Páginas Razor para renderização da interface com o usuário.
  - `JsonToCsv.cshtml`: Página principal que permite ao usuário colar o JSON e converter para CSV.
  - `Home.cshtml`: Página inicial com os links para as funções de conversão.

- **wwwroot**: Arquivos estáticos, como JavaScript, CSS e imagens.

## Funcionalidades Detalhadas

### 1. Conversão de JSON para CSV
   - **Front-end**: A conversão é feita via JavaScript. O JSON é analisado diretamente no navegador e convertido para CSV.
   - **Back-end**: A conversão é feita no servidor via API. O JSON enviado é validado e convertido para CSV no servidor, oferecendo maior controle sobre a conversão.

### 2. Validação e Feedback ao Usuário
   - Mensagens claras de erro ou sucesso são exibidas ao usuário, garantindo uma experiência de uso amigável.

### 3. Exemplos de JSON
   - O sistema oferece exemplos pré-configurados de JSON, facilitando o uso da ferramenta sem necessidade de criar exemplos manualmente.

### 4. Download do CSV
   - Após a conversão, o usuário pode baixar o CSV diretamente.

### 5. Exibição de Resultados em Tabela
   - O CSV gerado pode ser visualizado em formato de tabela, permitindo uma análise rápida dos dados.
