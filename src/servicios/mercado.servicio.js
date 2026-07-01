import { MercadoPagoConfig, Payment } from "mercadopago";
import config from "../config.js";

export const client = new MercadoPagoConfig({
    accessToken: config.mpAccessToken
});

const payment = new Payment(client);

export async function devolverPago(idPagoMercadoPago){
    return await payment.refund({
        id: idPagoMercadoPago
    });
}