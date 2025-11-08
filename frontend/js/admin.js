// admin.js

// Verifica login
if (sessionStorage.getItem("logado") !== "true") {
  alert("Você precisa fazer login primeiro!");
  window.location.href = "login.html";
}

// Elementos
const lista = document.getElementById("listaCarnes");
const form = document.getElementById("formCadastro");
const filtroCategorias = document.getElementById("filtroCategorias");
const inputBusca = document.getElementById("busca"); // corresponde ao admin.html

// Categorias
const categorias = ["Todas", "Bovina", "Suína", "Aves", "Peixes", "Outros"];

// Cria menu de categorias (se existir container)
if (filtroCategorias) {
  filtroCategorias.innerHTML = categorias
    .map((cat, i) => `<button class="btnFiltro" data-cat="${cat}" ${i===0? 'data-ativo="true"': ''}>${cat}</button>`)
    .join("");

  // adiciona listeners
  filtroCategorias.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      // marca ativo visualmente
      filtroCategorias.querySelectorAll("button").forEach((b) => b.classList.remove("ativo"));
      btn.classList.add("ativo");

      categoriaSelecionada = btn.dataset.cat;
      exibirCarnesFiltradas();
    });
  });
}

let categoriaSelecionada = "Todas";
let termoBusca = "";
let todasCarnes = [];

// Busca e cacheia carnes
async function carregarCarnes() {
  try {
    const res = await fetch("http://localhost:3000/carnes");
    todasCarnes = await res.json();
    exibirCarnesFiltradas();
  } catch (err) {
    console.error("Erro ao buscar carnes:", err);
    lista.innerHTML = "<li>Erro ao carregar carnes.</li>";
  }
}

// Exibe listagem aplicando filtros
function exibirCarnesFiltradas() {
  lista.innerHTML = "";

  const filtradas = todasCarnes.filter((carne) => {
    const nomeOK = carne.nome.toLowerCase().includes((termoBusca || "").toLowerCase());
    const cat = carne.categoria || "Outros";
    const catOK = categoriaSelecionada === "Todas" || cat.toLowerCase() === (categoriaSelecionada || "").toLowerCase();
    return nomeOK && catOK;
  });

  if (filtradas.length === 0) {
    lista.innerHTML = "<li>Nenhuma carne encontrada.</li>";
    return;
  }

  // Agrupa por categoria (exceto 'Todas')
  categorias.slice(1).forEach((cat) => {
    const carnesCat = filtradas.filter((c) => (c.categoria || "Outros") === cat);
    if (carnesCat.length > 0) {
      const titulo = document.createElement("h3");
      titulo.textContent = `🐄 ${cat}`;
      lista.appendChild(titulo);

      carnesCat.forEach((carne) => {
        const li = document.createElement("li");
        li.innerHTML = `
          <strong>${carne.nome}</strong> — R$ ${carne.preco.toFixed(2)} — ${carne.estoque ? "Disponível" : "Fora de estoque"}
          <div class="acoes">
            <button class="btn-editar" data-id="${carne.id}">Editar</button>
            <button class="btn-excluir" data-id="${carne.id}">Excluir</button>
          </div>
        `;
        lista.appendChild(li);
      });
    }
  });

  // conecta botões (listeners)
  lista.querySelectorAll(".btn-excluir").forEach((b) => {
    b.addEventListener("click", () => excluirCarne(b.dataset.id));
  });
  lista.querySelectorAll(".btn-editar").forEach((b) => {
    b.addEventListener("click", () => editarCarne(b.dataset.id));
  });
}

// Função pública (se quiser chamar por onclick)
function filtrarPorCategoria(cat) {
  categoriaSelecionada = cat;
  // marca botão ativo se existir container
  if (filtroCategorias) {
    filtroCategorias.querySelectorAll("button").forEach((b) => {
      b.classList.toggle("ativo", b.dataset.cat === cat);
    });
  }
  exibirCarnesFiltradas();
}

// CADASTRAR
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nome = document.getElementById("nome").value.trim();
  const preco = parseFloat(document.getElementById("preco").value);
  const estoque = document.getElementById("estoque").value === "true";
  const categoria = document.getElementById("categoria").value || "Outros";

  if (!nome || isNaN(preco)) {
    alert("Preencha corretamente os campos de nome e preço!");
    return;
  }

  try {
    await fetch("http://localhost:3000/carnes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, preco, estoque, categoria }),
    });
    form.reset();
    await carregarCarnes();
  } catch (err) {
    console.error("Erro ao cadastrar:", err);
    alert("Erro ao cadastrar carne.");
  }
});

// EXCLUIR
async function excluirCarne(id) {
  if (!confirm("Deseja excluir esta carne?")) return;
  try {
    await fetch(`http://localhost:3000/carnes/${id}`, { method: "DELETE" });
    await carregarCarnes();
  } catch (err) {
    console.error("Erro ao excluir:", err);
    alert("Erro ao excluir carne.");
  }
}

// EDITAR
async function editarCarne(id) {
  try {
    const res = await fetch(`http://localhost:3000/carnes/${id}`);
    if (!res.ok) throw new Error("Carne não encontrada");
    const carneAtual = await res.json();

    const nome = prompt("Novo nome:", carneAtual.nome);
    const precoInput = prompt("Novo preço:", carneAtual.preco);
    const preco = parseFloat(precoInput);
    const estoque = confirm("Tem no estoque? (OK = Sim, Cancelar = Não)");
    const categoriaInput = prompt("Categoria (Bovina, Suína, Aves, Peixes, Outros):", carneAtual.categoria || "Outros");
    const categoria = categoriaInput ? categoriaInput : (carneAtual.categoria || "Outros");

    if (!nome || isNaN(preco)) {
      alert("Preencha corretamente os campos de nome e preço!");
      return;
    }

    await fetch(`http://localhost:3000/carnes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, preco, estoque, categoria }),
    });

    await carregarCarnes();
  } catch (err) {
    console.error("Erro ao editar:", err);
    alert("Erro ao editar carne.");
  }
}

// PESQUISA: liga o input de busca
if (inputBusca) {
  inputBusca.addEventListener("input", (e) => {
    termoBusca = e.target.value;
    exibirCarnesFiltradas();
  });
}

// Carrega ao abrir
carregarCarnes();

// Logout (seguro)
const btnLogout = document.getElementById("logout");
if (btnLogout) {
  btnLogout.addEventListener("click", function () {
    sessionStorage.removeItem("logado");
    alert("Você saiu do sistema.");
    window.location.href = "login.html";
  });
}
