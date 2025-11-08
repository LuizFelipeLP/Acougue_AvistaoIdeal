const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();

app.use(cors());
app.use(express.json());

const caminhoArquivo = './carnes.json';

// Função para ler o arquivo JSON
function lerCarnes() {
  try {
    const dados = fs.readFileSync(caminhoArquivo, 'utf8');
    return JSON.parse(dados);
  } catch (err) {
    console.error('Erro ao ler carnes:', err);
    return [];
  }
}

// Função para salvar no arquivo JSON
function salvarCarnes(carnes) {
  fs.writeFileSync(caminhoArquivo, JSON.stringify(carnes, null, 2));
}

// Rota: listar carnes
app.get('/carnes', (req, res) => {
  const carnes = lerCarnes();
  res.json(carnes);
});

app.post('/carnes', (req, res) => {
  const carnes = lerCarnes();
  const novoId = carnes.length > 0 ? carnes[carnes.length - 1].id + 1 : 1;
  const novaCarne = { id: novoId, ...req.body };
  carnes.push(novaCarne);
  salvarCarnes(carnes);
  res.status(201).json(novaCarne);
});

// Rota: editar carne
app.put('/carnes/:id', (req, res) => {
  const carnes = lerCarnes();
  const id = parseInt(req.params.id);
  const indice = carnes.findIndex(c => c.id === id);

  if (indice === -1) {
    return res.status(404).json({ erro: 'Carne não encontrada' });
  }

  carnes[indice] = { ...carnes[indice], ...req.body };
  salvarCarnes(carnes);
  res.json(carnes[indice]);
});

// Rota: excluir carne
app.delete('/carnes/:id', (req, res) => {
  const carnes = lerCarnes();
  const id = parseInt(req.params.id);
  const novasCarnes = carnes.filter(c => c.id !== id);

  if (novasCarnes.length === carnes.length) {
    return res.status(404).json({ erro: 'Carne não encontrada' });
  }

  salvarCarnes(novasCarnes);
  res.json({ mensagem: 'Carne removida com sucesso' });
});

app.listen(3000, () => console.log('Servidor rodando na porta 3000'));
