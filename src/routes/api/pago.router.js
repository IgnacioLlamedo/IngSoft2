import express from "express";
import { crearPreferencia, almacenarPagoController } from "../../controllers/mercadoPago.controller.js";

export const pagoRouter = express.Router();

pagoRouter.post("/crear-preferencia", crearPreferencia);
pagoRouter.post("/guardarPago", almacenarPagoController);