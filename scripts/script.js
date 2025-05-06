// Função para buscar dados simulados do arquivo JSON
async function buscarDadosSimulados() {
  try {
    const response = await fetch("./personagens_simulados.json");
    if (!response.ok) {
      throw new Error(`Erro ao carregar dados simulados: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Falha ao carregar dados simulados:", error);
    // Um fallback mínimo caso o arquivo JSON não seja encontrado
    return {
      results: [
        {
          name: "Dados Indisponíveis",
          birth_year: "Desconhecido",
          homeworld: "Desconhecido",
        },
      ],
    };
  }
}

// Função para tentar buscar dados da API e usar dados simulados como fallback
async function buscarDados() {
  try {
    // Primeiro, tentamos com a API mais recente (com proxy CORS)
    const response = await fetch(
      "https://corsproxy.io/?https://swapi.dev/api/people/"
    );

    // Verifica se a requisição foi bem-sucedida
    if (!response.ok) {
      throw new Error(`Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Dados obtidos da API com sucesso:", data);
    return data;
  } catch (error) {
    console.warn("Falha ao buscar dados da API:", error);
    console.log("Usando dados simulados como fallback");
    return await buscarDadosSimulados();
  }
}

// Função para obter dados do planeta (com tratamento para dados simulados)
async function buscarPlaneta(planetaUrl) {
  // Se for uma string simples, é um dado simulado
  if (typeof planetaUrl === "string" && !planetaUrl.startsWith("http")) {
    return { name: planetaUrl };
  }

  try {
    // Adiciona o proxy CORS à URL do planeta
    const proxyUrl = `https://corsproxy.io/?${planetaUrl}`;
    const response = await fetch(proxyUrl);

    if (!response.ok) {
      throw new Error(`Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.warn("Falha ao buscar dados do planeta:", error);
    return { name: "Desconhecido" };
  }
}

async function renderizaCards() {
  const lista = document.querySelector("#cardList");
  lista.innerHTML = "";

  try {
    // Indicador de carregamento
    lista.innerHTML = `<p style="color: white; text-align: center">Carregando dados...</p>`;

    // Busca os dados (da API ou fallback para simulados)
    const listaDeDados = await buscarDados();

    // Limpa o indicador de carregamento
    lista.innerHTML = "";

    // Processa os resultados obtidos
    for (let indice = 0; indice < listaDeDados.results.length; indice++) {
      const elemento = listaDeDados.results[indice];

      const li = document.createElement("li");
      const divFrente = document.createElement("div");
      const divVerso = document.createElement("div");
      const divNomeFrente = document.createElement("div");
      const divNomeVerso = document.createElement("div");
      const listaDados = document.createElement("ul");
      const anoNasc = document.createElement("li");
      const planeta = document.createElement("li");
      const imagem = document.createElement("img");

      li.classList.add("card", "listCard");
      divFrente.classList.add("face", "front");

      divNomeFrente.classList.add("titleCard");
      divNomeFrente.innerText = elemento.name;

      divNomeVerso.classList.add("titleCard");
      divNomeVerso.innerText = elemento.name;

      listaDados.classList.add("cardData");

      anoNasc.innerText = "Ano de Nascimento: " + elemento.birth_year;

      // Busca os dados do planeta (com tratamento diferente para API vs simulado)
      const nomePlaneta = await buscarPlaneta(elemento.homeworld);
      planeta.innerText = "Planeta: " + nomePlaneta.name;

      divVerso.classList.add("face", "back");

      imagem.src = "./images/starduck.png";
      imagem.alt = "starduck";

      listaDados.append(anoNasc, planeta);
      divFrente.append(divNomeFrente, listaDados);
      divVerso.append(divNomeVerso, imagem);
      li.append(divFrente, divVerso);
      lista.append(li);
    }

    viraCard();
  } catch (error) {
    console.error("Erro ao processar dados:", error);
    lista.innerHTML = `<p style="color: white; text-align: center">Erro ao processar dados. Verifique o console para mais detalhes.</p>`;
  }
}

function viraCard() {
  const cards = document.querySelectorAll(".listCard");

  for (let indice = 0; indice < cards.length; indice++) {
    const card = cards[indice];

    card.addEventListener("click", function () {
      card.classList.toggle("flip");
    });
  }
}

// Adicionar evento para quando a página terminar de carregar
document.addEventListener("DOMContentLoaded", function () {
  renderizaCards();
});
