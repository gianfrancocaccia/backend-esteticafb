import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import UalaApiCheckout from "ualabis-nodejs";

dotenv.config();

const app = express();

const allowedOrigins = [

  "http://localhost:5173",

  "https://esteticsafb-reac.vercel.app"

];

app.use(
  cors({

    origin: function (origin, callback) {

      if (!origin) {
        return callback(null, true);
      }

      if (
        allowedOrigins.includes(origin)
      ) {

        return callback(null, true);

      }

      return callback(
        new Error("CORS no permitido")
      );

    }

  })
);

app.use(express.json());

await UalaApiCheckout.setUp({

  userName:
    process.env.UALA_USERNAME,

  clientId:
    process.env.UALA_CLIENT_ID,

  clientSecret:
    process.env.UALA_CLIENT_SECRET,

  isDev: false

});

app.post(
  "/create_preference",
  async (req, res) => {

    try {

      const {
        title,
        price,
        sucursal
      } = req.body;

      const order =
  await UalaApiCheckout.createOrder({

    amount:
      Number(price),

    description:
      `${title} - ${sucursal}`,

    callbackSuccess:
`${process.env.FRONT_URL}/gracias?tratamiento=${encodeURIComponent(title)}&sucursal=${encodeURIComponent(sucursal)}`,

    callbackFail:
`${process.env.FRONT_URL}/error`

  });

console.log(
  JSON.stringify(order, null, 2)
);

res.json({

  init_point:
    order.links.checkoutLink

});


    } catch (error) {

      console.log(error);

      res.status(500).json({

        error:
          "Error creando pago"

      });

    }

  }
);

const PORT =
  process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log(
    `Servidor corriendo en puerto ${PORT}`
  );

});