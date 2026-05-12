import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MercadoPagoConfig, Preference } from "mercadopago";

dotenv.config();

const app = express();

// CORS - permití el front temporalmente
app.use(cors({ origin: process.env.FRONT_URL || "*" }));
app.use(express.json());

// Mercado Pago client
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN
});

// Endpoint para crear preferencia
app.post("/create_preference", async (req, res) => {
  try {
    const preference = new Preference(client);

    const response = await preference.create({
      body: {
        items: [
          {
            title: req.body.title,
            quantity: 1,
            unit_price: Number(req.body.price),
            currency_id: "ARS"
          }
        ],
        back_urls: {
          success: `${process.env.FRONT_URL}/gracias`,
          failure: `${process.env.FRONT_URL}/error`,
          pending: `${process.env.FRONT_URL}/pendiente`
        },
        auto_return: "approved"
      }
    });

    res.json({
      id: response.id,
      init_point: response.init_point
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error creando preferencia" });
  }
});

// Puerto dinámico para Railway
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});