import { MercadoPagoConfig } from "mercadopago";
import config from "../config.js";

export const client = new MercadoPagoConfig({
    accessToken: config.mpAccessToken
});