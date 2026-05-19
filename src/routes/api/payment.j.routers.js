import express from "express";
import { createPreference } from "../../controllers/payment.controller.js";

export const paymentRouter = express.Router();

paymentRouter.post('/pay', createPreference);