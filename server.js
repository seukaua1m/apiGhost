import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const app = express();

const PORT = process.env.PORT || 3000;

// Endpoint proxy
app.get("/api/dados", async (req, res) => {
  try {
    const resposta = await fetch("https://api.exemplo.com/dados", {
      headers: {
        "Authorization": `Bearer ${process.env.API_SECRET_KEY}`
      }
    });

    const dados = await resposta.json();
    res.json(dados);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao buscar dados" });
  }
});

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
