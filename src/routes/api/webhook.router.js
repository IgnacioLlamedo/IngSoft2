import express from "express";
import { webhookPago, webhookPagoRestante } from "../../controllers/webhook.controller.js";

export const webhookRouter = express.Router();
webhookRouter.use("/webhook", webhookPago);
webhookRouter.use("/pago-restante", webhookPagoRestante)