import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();

app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// Endpoint para criar transação PIX
app.post("/pix", async (req, res) => {
  try {
    // Garantir que o telefone tenha o formato +55XXXXXXXXXX
    let phone = req.body.phone || "";
    if (!phone.startsWith("+")) {
      if (phone.length === 11 && !phone.startsWith("55")) {
        phone = "+55" + phone; // Ex: 11987654321
      } else if (phone.length === 13 && phone.startsWith("55")) {
        phone = "+" + phone;
      }
    }

    // Garantir formato dos itens
    const items = (req.body.items && req.body.items.length > 0) ? req.body.items.map(item => ({
      unitPrice: item.unitPrice || req.body.amount,
      title: item.title || "Taxa de Envio - Cartão Mercado Livre",
      quantity: item.quantity || 1,
      tangible: typeof item.tangible === "boolean" ? item.tangible : true
    })) : [{
      unitPrice: req.body.amount,
      title: "Taxa de Envio - Cartão Mercado Livre",
      quantity: 1,
      tangible: true
    }];

    // Montar payload final
    const body = {
      name: req.body.name,
      email: req.body.email,
      cpf: req.body.cpf,
      phone: phone,
      paymentMethod: "PIX",
      amount: req.body.amount, // valor em centavos
      traceable: true,
      items
    };

    console.log("Payload enviado para GhostsPay:", body);

    const response = await fetch("https://app.ghostspaysv1.com/api/v1/transaction.purchase", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": process.env.SECRET_KEY
      },
      body: JSON.stringify(body)
    });

    // Tentar obter JSON, mesmo em erros
    let data;
    try {
      data = await response.json();
    } catch (err) {
      const text = await response.text();
      console.error("Resposta não-JSON da GhostsPay:", text);
      return res.status(500).json({ error: "Resposta inválida da API", raw: text });
    }

    if (!response.ok) {
      console.error("Erro da GhostsPay:", data);
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (error) {
    console.error("Erro ao criar PIX:", error);
    res.status(500).json({ error: "Falha ao criar PIX", details: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
