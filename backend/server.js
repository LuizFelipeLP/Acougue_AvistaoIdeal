// backend/server.js

const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const PORT = 3000;

// 🧩 Middlewares
app.use(cors());
app.use(express.json());

// 🗄️ Caminho do banco de dados
const dbPath = path.resolve(__dirname, "database", "carnes.db");
const db = new sqlite3.Database(dbPath);

// 🧱 Cria tabelas se não existirem
db.serialize(() => {
  // 🥩 Tabela de carnes
  db.run(`
    CREATE TABLE IF NOT EXISTS carnes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      preco REAL NOT NULL,
      estoque INTEGER NOT NULL,
      categoria TEXT DEFAULT 'Outros'
    )
  `);

  // 👤 Tabela de usuários
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      senha TEXT NOT NULL
    )
  `);

  console.log("📦 Tabelas 'carnes' e 'usuarios' prontas no banco de dados!");
});

// 🧾 Rota: Listar todas as carnes
app.get("/carnes", (req, res) => {
  db.all("SELECT * FROM carnes", (err, rows) => {
    if (err) {
      console.error("Erro ao buscar carnes:", err);
      return res.status(500).json({ erro: "Erro ao buscar carnes" });
    }
    res.json(rows);
  });
});

// 🔍 Rota: Buscar carne por ID (necessária para o botão Editar)
app.get("/carnes/:id", (req, res) => {
  const { id } = req.params;

  db.get("SELECT * FROM carnes WHERE id = ?", [id], (err, row) => {
    if (err) {
      console.error("Erro ao buscar carne:", err);
      return res.status(500).json({ erro: "Erro ao buscar carne" });
    }

    if (!row) {
      return res.status(404).json({ erro: "Carne não encontrada" });
    }

    res.json(row);
  });
});

// ➕ Rota: Cadastrar nova carne
app.post("/carnes", (req, res) => {
  const { nome, preco, estoque, categoria } = req.body;

  if (!nome || preco == null || estoque == null) {
    return res.status(400).json({ erro: "Dados incompletos" });
  }

  const sql = `INSERT INTO carnes (nome, preco, estoque, categoria) VALUES (?, ?, ?, ?)`;
  db.run(sql, [nome, preco, estoque ? 1 : 0, categoria || "Outros"], function (err) {
    if (err) {
      console.error("Erro ao adicionar carne:", err);
      return res.status(500).json({ erro: "Erro ao adicionar carne" });
    }
    res.status(201).json({ id: this.lastID, nome, preco, estoque, categoria });
  });
});

// ✏️ Rota: Editar carne existente
app.put("/carnes/:id", (req, res) => {
  const { nome, preco, estoque, categoria } = req.body;
  const { id } = req.params;

  const sql = `
    UPDATE carnes 
    SET nome = ?, preco = ?, estoque = ?, categoria = ?
    WHERE id = ?
  `;

  db.run(sql, [nome, preco, estoque ? 1 : 0, categoria || "Outros", id], function (err) {
    if (err) {
      console.error("Erro ao atualizar carne:", err);
      return res.status(500).json({ erro: "Erro ao atualizar carne" });
    }

    if (this.changes === 0) {
      return res.status(404).json({ erro: "Carne não encontrada" });
    }

    res.json({ mensagem: "Carne atualizada com sucesso" });
  });
});

// ❌ Rota: Excluir carne
app.delete("/carnes/:id", (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM carnes WHERE id = ?", [id], function (err) {
    if (err) {
      console.error("Erro ao excluir carne:", err);
      return res.status(500).json({ erro: "Erro ao excluir carne" });
    }

    if (this.changes === 0) {
      return res.status(404).json({ erro: "Carne não encontrada" });
    }

    res.json({ mensagem: "Carne removida com sucesso" });
  });
});

// 🚀 Inicializa servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});
