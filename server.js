import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(express.json());

// Endpoint para criar transação PIX
app.post("/pix", async (req, res) => {
  try {
    const body = {
      name: req.body.name,
      email: req.body.email,
      cpf: req.body.cpf,
      phone: req.body.phone,
      paymentMethod: "PIX",
      amount: req.body.amount, // valor em centavos
      traceable: true,
      items: req.body.items
    };

    const response = await fetch("https://app.ghostspaysv1.com/api/v1/transaction.purchase", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": process.env.SECRET_KEY
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Erro ao criar PIX:", error);
    res.status(500).json({ error: "Falha ao criar PIX" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
