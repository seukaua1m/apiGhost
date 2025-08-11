import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Exemplo de rota proxy
app.get("/api/dados", async (req, res) => {
  try {
    const resposta = await fetch("https://api.exemplo.com/endpoint", {
      headers: {
        "X-Public-Key": process.env.PUBLIC_KEY,
        "X-Secret-Key": process.env.SECRET_KEY
      }
    });

    const dados = await resposta.json();
    res.json(dados);
  } catch (err) {
    res.status(500).json({ erro: "Falha ao buscar dados" });
  }
});

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
