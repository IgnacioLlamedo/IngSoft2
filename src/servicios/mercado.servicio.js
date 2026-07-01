import { MercadoPagoConfig, PaymentRefund  } from "mercadopago";
import config from "../config.js";

export const client = new MercadoPagoConfig({
    accessToken: config.mpAccessToken
});

const paymentRefund = new PaymentRefund(client);

export async function devolverPago(idPagoMercadoPago){
    console.log("Antes del refund");
    try{
        return await paymentRefund.total({
            payment_id: idPagoMercadoPago
        });
    }
    catch(e) {
        console.log("ERROR DESDE PAYMENTREFUND EN MERCADO.SERVICIO.JS");
        console.log(e);
    }
}