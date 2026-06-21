import express from "express";
import { crearPreferencia, confirmarPagoController, consultar } from "../../controllers/mercadoPago.controller.js";

export const pagoRouter = express.Router();

pagoRouter.post("/crear-preferencia", crearPreferencia);
pagoRouter.post("/consultar-pago", consultar);
pagoRouter.post("/confirmarPago", confirmarPagoController);
//, obtenerClaseGeneral
/* pagoRouter.post("/obtenerClaseGeneral", obtenerClaseGeneral); */
