import express from "express";
import { crearPreferencia, confirmarPagoController, consultar, getPaymentsController, obtenerPago } from "../../controllers/mercadoPago.controller.js";


export const pagoRouter = express.Router();

pagoRouter.post("/crear-preferencia", crearPreferencia);
pagoRouter.post("/consultar-pago", consultar);
pagoRouter.post("/confirmarPago", confirmarPagoController);
pagoRouter.get("/get-payments", getPaymentsController);
//pagoRouter.post("/webhook", webhookPago);
pagoRouter.get("/get-pago/:idPagoPendiente", obtenerPago);
//, obtenerClaseGeneral
/* pagoRouter.post("/obtenerClaseGeneral", obtenerClaseGeneral); */
