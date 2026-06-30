import express from "express";
import { webhookPago } from "../../controllers/webhook.controller.js";

export const webhookRouter = express.Router();
webhookRouter.use("/webhook", webhookPago);