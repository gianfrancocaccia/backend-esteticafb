import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MercadoPagoConfig, Preference } from "mercadopago";

dotenv.config();

const app = express();

// CORS para tu frontend
app.use(
  cors({
    origin: process.env.FRONT_URL,
    methods: ["GET","POST","OPTIONS"]
  })
);

app.use(express.json());

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN
});

app.post("/create_preference", async (req, res) => {
  try {
    const { title, price, sucursal } = req.body;

    const preference = new Preference(client);

    const response = await preference.create({
      body: {
        items: [
          {
            title,
            quantity: 1,
            unit_price: Number(price),
            currency_id: "ARS"
          }
        ],
        back_urls: {
          success: `${process.env.FRONT_URL}/gracias?tratamiento=${encodeURIComponent(title)}&sucursal=${encodeURIComponent(sucursal)}`
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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅Servidor corriendo en puerto ${PORT}`);
});