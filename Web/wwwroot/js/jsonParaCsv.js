$(document).ready(function () {
    $('#botaoConverter').on('click', function () {
        $('#modalConversao').modal('show');
    });

    $('#botaoFrontend').on('click', function () {
        $('#modalConversao').modal('hide');
        converterNoFrontend();
    });

    $('#botaoBackend').on('click', function () {
        $('#modalConversao').modal('hide');
        converterNoBackend();
    });

    $('#botaoLimpar').on('click', function () {
        limparCampos();
    });

    $('#botaoBaixarCsv').on('click', function () {
        baixarCsv();
    });

    function limparCampos() {
        $('#entradaJson').val('');
        $('#saidaCsv').val('');
        $('#mensagem').html('');
        $('#cartaoTabela').hide();
        $('#botaoBaixarCsv').hide();
        $('#selectExemploJson').prop('selectedIndex', 0);
    }

    function baixarCsv() {
        var conteudoCsv = $('#saidaCsv').val();
        if (conteudoCsv === '') {
            alert('Não há CSV disponível para download.');
            return;
        }

        var blob = new Blob([conteudoCsv], { type: 'text/csv;charset=utf-8;' });
        var url = URL.createObjectURL(blob);

        var linkDownload = document.createElement('a');
        linkDownload.href = url;
        linkDownload.download = 'resultado.csv';

        document.body.appendChild(linkDownload);
        linkDownload.click();
        document.body.removeChild(linkDownload);
    }

    function converterNoFrontend() {
        var jsonEntrada = $('#entradaJson').val().trim();
        var divMensagem = $('#mensagem');
        var areaSaidaCsv = $('#saidaCsv');

        divMensagem.html('');

        if (jsonEntrada === '') {
            divMensagem.html('<div class="alert alert-danger">Por favor, insira um JSON válido.</div>');
            $('#botaoBaixarCsv').hide();
            return;
        }

        try {
            var dadosJson = analisarJson(jsonEntrada);

            var resultadoCsv = converterJsonParaCsv(dadosJson);
            areaSaidaCsv.val(resultadoCsv);

            divMensagem.html('<div class="alert alert-success">Conversão realizada com sucesso (Front-end)!</div>');
            exibirTabela(resultadoCsv);

            $('#botaoBaixarCsv').show();
            $('#modalSucesso').modal('show');
        } catch (erro) {
            divMensagem.html('<div class="alert alert-danger">Erro ao converter JSON: ' + erro.message + '</div>');

            $('#botaoBaixarCsv').hide();
        }
    }

    function converterNoBackend() {
        var jsonEntrada = $('#entradaJson').val().trim();
        var divMensagem = $('#mensagem');
        var areaSaidaCsv = $('#saidaCsv');

        divMensagem.html('');

        if (jsonEntrada === '') {
            divMensagem.html('<div class="alert alert-danger">Por favor, insira um JSON válido.</div>');
            $('#botaoBaixarCsv').hide();
            return;
        }

        $.ajax({
            url: '/Conversao/JsonToCsv',
            method: 'POST',
            data: { jsonData: jsonEntrada },
            success: function (response) {
                areaSaidaCsv.val(response.csvData);
                divMensagem.html('<div class="alert alert-success">Conversão realizada com sucesso (Back-end)!</div>');
                exibirTabela(response.csvData);

                $('#botaoBaixarCsv').show();
                $('#modalSucesso').modal('show');
            },
            error: function (xhr) {
                divMensagem.html('<div class="alert alert-danger">Erro ao converter JSON no back-end: ' + xhr.responseText + '</div>');

                $('#botaoBaixarCsv').hide();
            }
        });
    }

    function analisarJson(jsonString) {
        jsonString = jsonString.trim();

        var resultado;
        if (jsonString.startsWith('[')) {
            resultado = analisarArrayJson(jsonString);
        } else if (jsonString.startsWith('{')) {
            resultado = [analisarObjetoJson(jsonString)];
        } else {
            throw new Error('Formato JSON inválido.');
        }

        return resultado;
    }
    function analisarArrayJson(jsonString) {
        jsonString = jsonString.trim();
        if (jsonString.startsWith('[') && jsonString.endsWith(']')) {
            jsonString = jsonString.substring(1, jsonString.length - 1).trim();
        } else {
            throw new Error('Array JSON inválido.');
        }

        var objetos = [];
        var objetoAtual = '';
        var chavesAbertas = 0;
        var dentroDeString = false;
        var charAnterior = '';

        for (var i = 0; i < jsonString.length; i++) {
            var charAtual = jsonString[i];

            if (charAtual === '"' && charAnterior !== '\\') {
                dentroDeString = !dentroDeString;
            }

            if (dentroDeString) {
                objetoAtual += charAtual;
            } else {
                if (charAtual === '{') {
                    if (chavesAbertas === 0) {
                        objetoAtual = '';
                    }
                    chavesAbertas++;
                    objetoAtual += charAtual;
                } else if (charAtual === '}') {
                    objetoAtual += charAtual;
                    chavesAbertas--;
                    if (chavesAbertas === 0) {
                        objetos.push(analisarObjetoJson(objetoAtual.trim()));
                        objetoAtual = '';
                    }
                } else if (chavesAbertas > 0) {
                    objetoAtual += charAtual;
                }
            }

            charAnterior = charAtual;
        }

        return objetos;
    }

    function analisarObjetoJson(jsonString) {
        jsonString = jsonString.trim();
        if (jsonString.startsWith('{') && jsonString.endsWith('}')) {
            jsonString = jsonString.substring(1, jsonString.length - 1).trim();
        } else {
            throw new Error('Objeto JSON inválido.');
        }

        var objeto = {};
        var pares = dividirParesChaveValor(jsonString);

        pares.forEach(function (par) {
            var indiceDoisPontos = par.indexOf(':');

            if (indiceDoisPontos === -1) {
                throw new Error('Par chave-valor inválido: ' + par);
            }

            var chave = par.substring(0, indiceDoisPontos).trim().replace(/^"|"$/g, '');
            var valor = par.substring(indiceDoisPontos + 1).trim();

            if (valor.startsWith('{') || valor.startsWith('[')) {
                valor = '';
            } else {
                valor = valor.replace(/^"|"$/g, '');
            }

            objeto[chave] = valor;
        });

        return objeto;
    }

    function dividirParesChaveValor(jsonContent) {
        var pares = [];
        var parAtual = '';
        var dentroDeString = false;
        var chavesAbertas = 0;
        var colchetesAbertos = 0;
        var charAnterior = '';

        for (var i = 0; i < jsonContent.length; i++) {
            var charAtual = jsonContent[i];

            if (charAtual === '"' && charAnterior !== '\\') {
                dentroDeString = !dentroDeString;
            }

            if (!dentroDeString) {
                if (charAtual === '{') {
                    chavesAbertas++;
                } else if (charAtual === '}') {
                    chavesAbertas--;
                } else if (charAtual === '[') {
                    colchetesAbertos++;
                } else if (charAtual === ']') {
                    colchetesAbertos--;
                } else if (charAtual === ',' && chavesAbertas === 0 && colchetesAbertos === 0) {
                    pares.push(parAtual.trim());
                    parAtual = '';
                    charAnterior = charAtual;
                    continue;
                }
            }

            parAtual += charAtual;
            charAnterior = charAtual;
        }

        if (parAtual.trim() !== '') {
            pares.push(parAtual.trim());
        }

        return pares;
    }

    function converterJsonParaCsv(dados) {
        var cabecalhos = [];

        dados.forEach(function (item) {
            for (var chave in item) {
                if (cabecalhos.indexOf(chave) === -1) {
                    cabecalhos.push(chave);
                }
            }
        });

        var linhasCsv = [];
        linhasCsv.push(cabecalhos.join(','));

        dados.forEach(function (item) {
            var linha = [];
            cabecalhos.forEach(function (chave) {
                var valor = item[chave] || '';
                linha.push(valor);
            });
            linhasCsv.push(linha.join(','));
        });

        return linhasCsv.join('\n');
    }

    function exibirTabela(csvData) {
        var cartaoTabela = $('#cartaoTabela');
        var tabelaResultado = $('#tabelaResultado');

        tabelaResultado.empty();

        var linhas = csvData.split('\n');
        var cabecalhos = linhas[0].split(',');
        var registros = linhas.slice(1);

        var thead = $('<thead>');
        var linhaCabecalho = $('<tr>');
        cabecalhos.forEach(function (cabecalho) {
            linhaCabecalho.append($('<th>').text(cabecalho));
        });
        thead.append(linhaCabecalho);
        tabelaResultado.append(thead);

        var tbody = $('<tbody>');
        registros.forEach(function (registro) {
            if (registro.trim() === '') return;

            var campos = registro.split(',');
            var linhaRegistro = $('<tr>');
            campos.forEach(function (campo) {
                linhaRegistro.append($('<td>').text(campo));
            });
            tbody.append(linhaRegistro);
        });
        tabelaResultado.append(tbody);

        cartaoTabela.show();
    }

    $('#botaoInserirExemplo').on('click', function () {
        inserirExemploJson();
    });

    function inserirExemploJson() {
        var exemploSelecionado = $('#selectExemploJson').val();
        var campoEntradaJson = $('#entradaJson');

        if (exemploSelecionado === '') {
            alert('Por favor, selecione um exemplo de JSON.');
            return;
        }

        var jsonExemplo = '';

        if (exemploSelecionado === 'exemplo1') {
            jsonExemplo = '{\n' +
                '    "nome": "Maria",\n' +
                '    "idade": "30",\n' +
                '    "cidade": "São Paulo"\n' +
                '}';
        } else if (exemploSelecionado === 'exemplo2') {
            jsonExemplo = '[\n' +
                '    {"nome": "João", "idade": "25", "cidade": "Rio de Janeiro"},\n' +
                '    {"nome": "Ana", "idade": "28", "cidade": "Belo Horizonte"},\n' +
                '    {"nome": "Pedro", "idade": "35", "cidade": "Curitiba"}\n' +
                ']';
        } 

        campoEntradaJson.val(jsonExemplo);
    }

});
