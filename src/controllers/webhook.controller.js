import config from "../config.js";
import { procesarWebhook } from "./mercadoPago.controller.js";

export async function webhookPago(req,res){
    try{
        /* console.log("🔥 WEBHOOK ENTRÓ");
        console.log("BODY:", req.body); */
        res.sendStatus(200);
        await procesarWebhook(req.body)
    }
    catch(error){
        console.error(error);
        res.sendStatus(500);
    }
}

export async function webhookPagoRestante(req, res){
    try{
        /* console.log("🔥 WEBHOOK ENTRÓ");
        console.log("BODY:", req.body); */
        res.sendStatus(200);
        await procesarWebhookPagoRestante(req.body)
    }
    catch(error){
        console.error(error);
        res.sendStatus(500);
    }
}