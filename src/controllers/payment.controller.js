import mercadopago from "mercadopago";
import dotenv from "dotenv";
//import { usuarioDao } from "../daos/index.js"; // SE DEBERÍA GUARDAR EL PAGO EN EL USUARIO?

/* dotenv.config();

mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN
}); */



export const createPreference = async (req, res) => {
  const { type, price } = req.body;

  const preference = {
    items: [
      {
        title: type,
        quantity: 1,
        unit_price: Number(price)
      }
    ],
    back_urls: {
      success: "http://localhost:8080/success",
      failure: "http://localhost:8080/failure",
      pending: "http://localhost:8080/pending"
    },
    //auto_return: "approved" Descomentar cuando se salga del ambito localhost
  };
  
  const response = await mercadopago.preferences.create(preference);

  res.json({ init_point: response.body.init_point });
};