import { Preference } from "mercadopago";
import { client } from "../servicios/mercado.servicio.js";

export async function crearPreferencia(req, res) {

    try {

        const { tipo, precio } = req.body;

        const preference = new Preference(client);

        const response = await preference.create({
            body: {
                items: [
                    {
                        title: tipo,
                        quantity: 1,
                        unit_price: Number(precio)
                    }
                ],
                back_urls: {
                    success: "http://localhost:8080/success.html",
                    failure: "http://localhost:8080/failure.html",
                    pending: "http://localhost:8080/pending.html"
                },
                //auto_return: "approved"
            }
        });

        res.json({
            init_point: response.init_point
        });

    } catch(error) {

        console.error(error);

        res.status(500).json({
            error: "Error al crear preferencia"
        });
    }
}