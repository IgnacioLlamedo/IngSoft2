import express from "express";
import { crearPreferencia, confirmarPagoController, consultar, getPaymentsController, getUserPaymentsController } from "../../controllers/mercadoPago.controller.js";

export const pagoRouter = express.Router();

pagoRouter.post("/crear-preferencia", crearPreferencia);
pagoRouter.post("/consultar-pago", consultar);
pagoRouter.post("/confirmarPago", confirmarPagoController);
pagoRouter.get("/get-payments", getPaymentsController);
pagoRouter.get("/get-user-payments", getUserPaymentsController);
//, obtenerClaseGeneral
/* pagoRouter.post("/obtenerClaseGeneral", obtenerClaseGeneral); */
