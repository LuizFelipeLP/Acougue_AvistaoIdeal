// script.js — parte pública (index.html)

// 🧩 Elementos
const lista = document.getElementById('listaCarnes');
const campoBusca = document.getElementById('campoBusca');
const menuCategorias = document.getElementById('menuCategorias');

// 📂 Categorias padrão
const categorias = ['Todas', 'Bovina', 'Suína', 'Aves', 'Peixes', 'Outros'];

let categoriaSelecionada = 'Todas';
let carnesCache = [];

// ----- CRIAR MENU -----
if (menuCategorias) {
  menuCategorias.innerHTML = categorias
    .map(
      (cat) =>
        `<button class="btnCategoria" onclick="filtrarPorCategoria('${cat}')">${cat}</button>`
    )
    .join('');
}

// ----- CARREGAR CARNES -----
async function carregarCarnes(filtroTexto = '') {
  try {
    // Se não temos carnes em cache, busca do servidor
    if (carnesCache.length === 0) {
      const resposta = await fetch('http://localhost:3000/carnes');
      carnesCache = await resposta.json();
    }

    lista.innerHTML = '';

    // 🔍 Filtra carnes por nome e categoria
    const carnesFiltradas = carnesCache.filter((c) => {
      const nomeOK = c.nome.toLowerCase().includes(filtroTexto.toLowerCase());
      const categoriaOK =
        categoriaSelecionada === 'Todas' ||
        (c.categoria || 'Outros') === categoriaSelecionada;
      return nomeOK && categoriaOK;
    });

    if (carnesFiltradas.length === 0) {
      lista.innerHTML = '<li>Nenhuma carne encontrada.</li>';
      return;
    }

    // Agrupa por categoria
    const categoriasExibir = categorias.filter(
      (cat) => cat === 'Todas' || carnesFiltradas.some((c) => (c.categoria || 'Outros') === cat)
    );

    categoriasExibir.forEach((categoria) => {
      if (categoria === 'Todas') return; // não cria cabeçalho "Todas"

      const carnesCat = carnesFiltradas.filter(
        (c) => (c.categoria || 'Outros') === categoria
      );

      if (carnesCat.length > 0) {
        const titulo = document.createElement('h3');
        titulo.textContent = categoria;
        titulo.classList.add('titulo-categoria');
        lista.appendChild(titulo);

        const grid = document.createElement('div');
        grid.classList.add('lista-carnes');

        carnesCat.forEach((carne) => {
          const card = document.createElement('div');
          card.classList.add('card');
          card.innerHTML = `
            <h3>${carne.nome}</h3>
            <p>Preço: <strong>R$ ${carne.preco.toFixed(2)}</strong></p>
            <p class="${carne.estoque ? 'disponivel' : 'indisponivel'}">
              ${carne.estoque ? 'Disponível 🟢' : 'Fora de estoque 🔴'}
            </p>
          `;
          grid.appendChild(card);
        });

        lista.appendChild(grid);
      }
    });
  } catch (erro) {
    console.error('Erro ao carregar carnes:', erro);
    lista.innerHTML = '<li>Erro ao carregar carnes.</li>';
  }
}

// ----- FILTRAR POR CATEGORIA -----
function filtrarPorCategoria(cat) {
  categoriaSelecionada = cat;
  carregarCarnes(campoBusca ? campoBusca.value : '');
}

// ----- FILTRO DE TEXTO -----
if (campoBusca) {
  campoBusca.addEventListener('input', (e) => {
    carregarCarnes(e.target.value);
  });
}

// 🚀 Carrega carnes ao abrir a página
document.addEventListener('DOMContentLoaded', () => carregarCarnes());
